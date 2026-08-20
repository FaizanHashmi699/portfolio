"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { features } from "@/server/env";
import {
  DEMO_ROLE_COOKIE,
  DEMO_SIGNED_OUT_COOKIE,
  getSupabaseServerClient,
} from "@/server/auth";
import { rateLimit } from "@/server/services/rate-limit";
import { emailSchema, nameSchema } from "./schemas";
import { headers } from "next/headers";

/**
 * Authentication actions.
 *
 * Two paths behind one interface. With Supabase configured these perform real
 * authentication; without it they set a demo cookie so the flows are exercisable — and
 * testable — on a checkout with no credentials.
 *
 * Error messages are deliberately non-committal about whether an account exists. Telling
 * an attacker "no account with that email" turns the sign-in form into a user-enumeration
 * oracle, and for a product whose customers are migrants, confirming that a specific person
 * holds a UAE visa application is a real privacy harm.
 */

export interface AuthState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
}

const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters — length matters more than symbols")
  .max(200);

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Please enter your password").max(200),
});

const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  acceptedTerms: z.literal(true, {
    message: "Please accept the terms and privacy policy to continue",
  }),
});

const emailOnlySchema = z.object({ email: emailSchema });

const resetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Those passwords don't match",
    path: ["confirmPassword"],
  });

async function limitKey(prefix: string): Promise<string> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${prefix}:${ip}`;
}

const GENERIC_FAILURE =
  "That email and password combination didn't work. Please try again.";

export async function signIn(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  // Tighter than other forms: this is the endpoint worth brute-forcing.
  const limit = rateLimit(await limitKey("sign-in"), { limit: 8, windowMs: 300_000 });
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (!features.database) {
    // Demo mode has no credential store. Signing in resumes the demo session.
    const store = await cookies();
    store.delete(DEMO_SIGNED_OUT_COOKIE);
    redirect("/portal");
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { status: "error", message: GENERIC_FAILURE };

  redirect("/portal");
}

export async function signUp(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const limit = rateLimit(await limitKey("sign-up"), { limit: 5, windowMs: 600_000 });
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    acceptedTerms: formData.get("acceptedTerms") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (!features.database) {
    const store = await cookies();
    store.delete(DEMO_SIGNED_OUT_COOKIE);
    redirect("/portal");
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.name } },
  });

  if (error) {
    // Never confirm whether the address is already registered.
    return {
      status: "success",
      message:
        "Check your inbox — if we could create an account for that address, a confirmation link is on its way.",
    };
  }

  return {
    status: "success",
    message:
      "Check your inbox — if we could create an account for that address, a confirmation link is on its way.",
  };
}

export async function requestPasswordReset(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const limit = rateLimit(await limitKey("password-reset"), {
    limit: 4,
    windowMs: 600_000,
  });
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  const parsed = emailOnlySchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Always the same answer, whether or not the account exists.
  const confirmation: AuthState = {
    status: "success",
    message:
      "If there's an account for that address, we've sent a reset link. It expires in one hour.",
  };

  if (!features.database) return confirmation;

  const supabase = await getSupabaseServerClient();
  const headerList = await headers();
  const origin = headerList.get("origin") ?? "";

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/reset-password`,
  });

  return confirmation;
}

export async function resetPassword(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = resetSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (!features.database) {
    return {
      status: "success",
      message: "Password updated. In demo mode nothing is stored.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return {
      status: "error",
      message: "That reset link has expired. Please request a new one.",
    };
  }

  return { status: "success", message: "Password updated. You can sign in now." };
}

export async function signOut(): Promise<never> {
  const store = await cookies();

  if (features.database) {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.signOut();
  } else {
    store.set(DEMO_SIGNED_OUT_COOKIE, "1", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    store.delete(DEMO_ROLE_COOKIE);
  }

  redirect("/sign-in");
}

/**
 * Demo-only role switch, so the customer portal and the staff console can both be
 * explored without provisioning two accounts. Refuses outright once real auth is
 * configured — otherwise it would be a privilege-escalation endpoint.
 */
export async function switchDemoRole(role: "customer" | "admin"): Promise<void> {
  if (features.database) {
    throw new Error("Role switching is only available in demo mode");
  }
  const store = await cookies();
  store.delete(DEMO_SIGNED_OUT_COOKIE);
  store.set(DEMO_ROLE_COOKIE, role, { path: "/", httpOnly: true, sameSite: "lax" });
}

const profileSchema = z.object({
  name: nameSchema,
});

const notificationsSchema = z.object({
  emailStatusUpdates: z.coerce.boolean().default(false),
  emailExpiryReminders: z.coerce.boolean().default(false),
  emailProductUpdates: z.coerce.boolean().default(false),
});

export async function updateProfile(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = profileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (!features.database) {
    return { status: "success", message: "Saved. In demo mode nothing is stored." };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  // Written to the profiles table, not to user metadata — metadata is user-editable and
  // must never be treated as authoritative for anything that matters.
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.name })
    .eq("id", user.id);

  if (error)
    return { status: "error", message: "Couldn't save that. Please try again." };

  return { status: "success", message: "Saved." };
}

export async function updateNotificationPreferences(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = notificationsSchema.safeParse({
    emailStatusUpdates: formData.get("emailStatusUpdates") === "on",
    emailExpiryReminders: formData.get("emailExpiryReminders") === "on",
    emailProductUpdates: formData.get("emailProductUpdates") === "on",
  });

  if (!parsed.success) {
    return { status: "error", message: "Couldn't save those preferences." };
  }

  if (!features.database) {
    return { status: "success", message: "Saved. In demo mode nothing is stored." };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  const { error } = await supabase
    .from("profiles")
    .update({ notification_preferences: parsed.data })
    .eq("id", user.id);

  if (error)
    return { status: "error", message: "Couldn't save that. Please try again." };

  return { status: "success", message: "Preferences saved." };
}

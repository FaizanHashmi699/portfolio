import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { DemoAuthNotice } from "@/components/auth/demo-notice";
import { SignInForm } from "@/components/auth/sign-in-form";
import { features } from "@/server/env";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to track your applications and see exactly where each one stands."
      footer={
        <p>
          No account yet?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Create one
          </Link>
          . You don&apos;t need one to{" "}
          <Link href="/eligibility" className="text-primary hover:underline">
            check your eligibility
          </Link>
          .
        </p>
      }
    >
      {!features.database && <DemoAuthNotice />}
      <SignInForm />
    </AuthCard>
  );
}

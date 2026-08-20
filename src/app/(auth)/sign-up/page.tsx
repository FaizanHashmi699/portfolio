import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { DemoAuthNotice } from "@/components/auth/demo-notice";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { features } from "@/server/env";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      description="You only need an account to start an application. Eligibility and pricing stay free and open."
      footer={
        <p>
          Already have one?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {!features.database && <DemoAuthNotice />}
      <SignUpForm />
    </AuthCard>
  );
}

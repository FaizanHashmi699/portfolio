import "server-only";
import { env, features } from "@/server/env";

/**
 * Transactional email.
 *
 * With no Resend key configured, messages are logged rather than sent. That keeps local
 * development and CI fully functional — and, importantly, keeps them from emailing real
 * people by accident.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(message: EmailMessage): Promise<{ sent: boolean }> {
  if (!features.email) {
    console.info(
      `[email:not-configured] to=${message.to} subject="${message.subject}"`,
    );
    return { sent: false };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL!,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  if (error) {
    // A failed notification must never fail the user's action — their lead is already saved.
    console.error("[email:failed]", error);
    return { sent: false };
  }

  return { sent: true };
}

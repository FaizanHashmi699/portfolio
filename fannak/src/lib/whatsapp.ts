/**
 * WhatsApp Cloud API — the delivery channel.
 *
 * Works UNVERIFIED at 250 business-initiated conversations per rolling 24h,
 * which is far above v1 volume, so no entity is needed to start.
 *
 * Every send is logged to `messages` by the caller: when a partner says
 * "you never sent me that lead", the log settles it.
 */

const GRAPH = "https://graph.facebook.com/v21.0";

export interface SendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

export const isWhatsappConfigured = Boolean(
  process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN,
);

/** Saudi numbers: normalise 05xxxxxxxx / +9665xxxxxxxx to 9665xxxxxxxx. */
export function normalisePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  if (digits.startsWith("5") && digits.length === 9) return `966${digits}`;
  return digits;
}

export async function sendTemplate(
  to: string,
  template: string,
  variables: string[],
): Promise<SendResult> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneId || !token) {
    return { ok: false, error: "WhatsApp not configured" };
  }

  try {
    const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalisePhone(to),
        type: "template",
        template: {
          name: template,
          language: { code: "ar" },
          components: variables.length
            ? [
                {
                  type: "body",
                  parameters: variables.map((text) => ({ type: "text", text })),
                },
              ]
            : undefined,
        },
      }),
    });

    const body = (await res.json()) as Record<string, any>;
    if (!res.ok) {
      return { ok: false, error: body?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, messageId: body?.messages?.[0]?.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "network error",
    };
  }
}

/** Fallback while templates are pending approval: a click-to-chat link. */
export function whatsappLink(to: string, text: string): string {
  return `https://wa.me/${normalisePhone(to)}?text=${encodeURIComponent(text)}`;
}

/**
 * Wathq — Ministry of Commerce commercial-registration lookup.
 * Free basic package: developer.wathq.sa
 *
 * This is the trust layer. A provider is only "verified" in the directory
 * when this returns an active CR — never because they typed one in.
 */

export interface WathqResult {
  ok: boolean;
  crNumber: string;
  name?: string;
  status?: string;
  isActive?: boolean;
  raw?: unknown;
  error?: string;
}

const ENDPOINT = "https://api.wathq.sa/v5/commercialregistration/info";

export async function verifyCommercialRegistration(
  crNumber: string,
): Promise<WathqResult> {
  const key = process.env.WATHQ_API_KEY;

  if (!/^\d{10}$/.test(crNumber)) {
    return { ok: false, crNumber, error: "CR number must be 10 digits" };
  }

  if (!key) {
    // No key yet: report honestly rather than pretending a check happened.
    return { ok: false, crNumber, error: "WATHQ_API_KEY not configured" };
  }

  try {
    const res = await fetch(`${ENDPOINT}/${crNumber}`, {
      headers: { apiKey: key, Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, crNumber, error: `Wathq returned ${res.status}` };
    }

    const data = (await res.json()) as Record<string, unknown>;
    const status = (data.status as Record<string, unknown> | undefined)?.name;
    const isActive =
      typeof status === "string" && /active|قائم|نشط/i.test(status);

    return {
      ok: true,
      crNumber,
      name: (data.crName as string) ?? (data.name as string),
      status: typeof status === "string" ? status : undefined,
      isActive,
      raw: data,
    };
  } catch (err) {
    return {
      ok: false,
      crNumber,
      error: err instanceof Error ? err.message : "network error",
    };
  }
}

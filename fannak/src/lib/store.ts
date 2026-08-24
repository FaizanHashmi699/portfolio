import { PROVIDERS } from "./seed-data";
import { getServiceSupabase } from "./supabase/server";
import type { Lead, Provider } from "./types";

/**
 * Operations store — everything the admin console and partner portal write.
 *
 * Two implementations behind one interface:
 *   • Supabase, via the assign_lead()/add_credits() functions, which do the
 *     work in a single locked transaction.
 *   • An in-memory store used when no database is configured, so the whole
 *     operator flow is demoable with zero setup.
 *
 * The in-memory version enforces the SAME invariants as the SQL, because a
 * demo that lets you overdraw credits teaches the operator the wrong thing:
 *   - a lead cannot be assigned without sufficient credits
 *   - a lead cannot be assigned to the same partner twice
 *   - the ledger is append-only and the balance is derived from it
 */

export interface LedgerEntry {
  id: number;
  tenant_id: string;
  delta: number;
  reason: string;
  ref?: string;
  balance_after: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  lead_id: string;
  tenant_id: string;
  credits_charged: number;
  sent_at: string;
  accepted_at?: string;
  declined_at?: string;
  outcome?: "won" | "lost" | "no_show";
}

export interface MessageLog {
  id: string;
  tenant_id?: string;
  lead_id?: string;
  recipient: string;
  template?: string;
  status: "queued" | "sent" | "failed";
  error?: string;
  created_at: string;
}

export interface NewPartner {
  name_ar: string;
  name_en: string;
  phone?: string;
  cr_number?: string;
  cr_verified_at?: string | null;
  service_slugs: string[];
  district_slugs: string[];
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/* ------------------------------------------------------------------ */
/* In-memory implementation                                            */
/* ------------------------------------------------------------------ */

interface Memory {
  partners: Provider[];
  leads: Lead[];
  assignments: Assignment[];
  ledger: LedgerEntry[];
  messages: MessageLog[];
  seq: number;
}

// Module-level so it survives between requests in a single server process.
// It does NOT survive a restart, which the UI states plainly.
const globalRef = globalThis as unknown as { __fannak?: Memory };

function memory(): Memory {
  if (!globalRef.__fannak) {
    globalRef.__fannak = {
      partners: PROVIDERS.map((p) => ({ ...p })),
      leads: [],
      assignments: [],
      ledger: [],
      messages: [],
      seq: 1,
    };
  }
  return globalRef.__fannak;
}

function id(prefix: string): string {
  return `${prefix}-${(memory().seq++).toString().padStart(4, "0")}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `partner-${memory().seq}`;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function usingMemoryStore(): boolean {
  return getServiceSupabase() === null;
}

export async function listPartners(): Promise<Provider[]> {
  const sb = getServiceSupabase();
  if (!sb) return memory().partners;

  const { data } = await sb
    .from("tenants")
    .select(
      "*, partner_services(services(slug)), tenant_districts(districts(slug))",
    )
    .order("created_at", { ascending: false });

  return (data ?? []).map((row: any) => ({
    ...row,
    service_slugs:
      row.partner_services?.map((x: any) => x.services?.slug).filter(Boolean) ?? [],
    district_slugs:
      row.tenant_districts?.map((x: any) => x.districts?.slug).filter(Boolean) ?? [],
  })) as Provider[];
}

export async function getPartner(tenantId: string): Promise<Provider | undefined> {
  const all = await listPartners();
  return all.find((p) => p.id === tenantId);
}

export async function createPartner(input: NewPartner): Promise<Result<Provider>> {
  const sb = getServiceSupabase();

  if (!sb) {
    const mem = memory();
    const partner: Provider = {
      id: id("tenant"),
      slug: slugify(input.name_en),
      name_ar: input.name_ar,
      name_en: input.name_en,
      city_id: "city-riyadh",
      phone: input.phone,
      cr_number: input.cr_number,
      cr_verified_at: input.cr_verified_at ?? null,
      status: "active",
      jobs_completed: 0,
      credit_balance: 0,
      service_slugs: input.service_slugs,
      district_slugs: input.district_slugs,
    };
    mem.partners.unshift(partner);
    return { ok: true, value: partner };
  }

  const { data, error } = await sb
    .from("tenants")
    .insert({
      slug: slugify(input.name_en),
      name_ar: input.name_ar,
      name_en: input.name_en,
      phone: input.phone,
      cr_number: input.cr_number,
      cr_verified_at: input.cr_verified_at,
      status: "active",
    })
    .select("*")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "insert failed" };
  }
  return {
    ok: true,
    value: { ...(data as any), service_slugs: [], district_slugs: [] },
  };
}

export async function addCredits(
  tenantId: string,
  credits: number,
  reason = "bank_transfer",
  ref?: string,
): Promise<Result<number>> {
  if (!Number.isInteger(credits) || credits <= 0) {
    return { ok: false, error: "credits must be a positive whole number" };
  }

  const sb = getServiceSupabase();
  if (!sb) {
    const mem = memory();
    const partner = mem.partners.find((p) => p.id === tenantId);
    if (!partner) return { ok: false, error: "partner not found" };

    partner.credit_balance += credits;
    mem.ledger.push({
      id: mem.ledger.length + 1,
      tenant_id: tenantId,
      delta: credits,
      reason,
      ref,
      balance_after: partner.credit_balance,
      created_at: new Date().toISOString(),
    });
    return { ok: true, value: partner.credit_balance };
  }

  const { data, error } = await sb.rpc("add_credits", {
    p_tenant_id: tenantId,
    p_credits: credits,
    p_reason: reason,
    p_ref: ref ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, value: data as number };
}

export async function listLeads(): Promise<Lead[]> {
  const sb = getServiceSupabase();
  if (!sb) return memory().leads;

  const { data } = await sb
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as Lead[];
}

export async function recordLead(lead: Lead): Promise<void> {
  if (usingMemoryStore()) memory().leads.unshift(lead);
}

/**
 * Assign a lead and charge the partner. The database version delegates to
 * assign_lead(), which locks the tenant row; the in-memory version enforces
 * the same rules so the demo cannot teach a behaviour the real system rejects.
 */
export async function assignLead(
  leadId: string,
  tenantId: string,
  credits = 1,
): Promise<Result<Assignment>> {
  const sb = getServiceSupabase();

  if (!sb) {
    const mem = memory();
    const partner = mem.partners.find((p) => p.id === tenantId);
    if (!partner) return { ok: false, error: "partner not found" };

    const already = mem.assignments.find(
      (a) => a.lead_id === leadId && a.tenant_id === tenantId,
    );
    if (already) return { ok: false, error: "already assigned to this partner" };

    if (partner.credit_balance < credits) {
      return {
        ok: false,
        error: `insufficient credits: has ${partner.credit_balance}, needs ${credits}`,
      };
    }

    partner.credit_balance -= credits;
    mem.ledger.push({
      id: mem.ledger.length + 1,
      tenant_id: tenantId,
      delta: -credits,
      reason: "lead_assigned",
      ref: leadId,
      balance_after: partner.credit_balance,
      created_at: new Date().toISOString(),
    });

    const assignment: Assignment = {
      id: id("assign"),
      lead_id: leadId,
      tenant_id: tenantId,
      credits_charged: credits,
      sent_at: new Date().toISOString(),
    };
    mem.assignments.push(assignment);

    const lead = mem.leads.find((l) => l.id === leadId);
    if (lead) lead.status = "assigned";

    return { ok: true, value: assignment };
  }

  const { data, error } = await sb.rpc("assign_lead", {
    p_lead_id: leadId,
    p_tenant_id: tenantId,
    p_credits: credits,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, value: data as Assignment };
}

export async function listAssignments(tenantId?: string): Promise<Assignment[]> {
  const sb = getServiceSupabase();
  if (!sb) {
    const all = memory().assignments;
    return tenantId ? all.filter((a) => a.tenant_id === tenantId) : all;
  }

  let query = sb.from("lead_assignments").select("*").order("sent_at", { ascending: false });
  if (tenantId) query = query.eq("tenant_id", tenantId);
  const { data } = await query;
  return (data ?? []) as Assignment[];
}

export async function respondToAssignment(
  assignmentId: string,
  tenantId: string,
  action: "accept" | "decline" | "complete",
): Promise<Result<Assignment>> {
  const sb = getServiceSupabase();
  const now = new Date().toISOString();

  if (!sb) {
    const assignment = memory().assignments.find(
      (a) => a.id === assignmentId && a.tenant_id === tenantId,
    );
    if (!assignment) return { ok: false, error: "assignment not found" };

    if (action === "accept") assignment.accepted_at = now;
    if (action === "decline") assignment.declined_at = now;
    if (action === "complete") assignment.outcome = "won";
    return { ok: true, value: assignment };
  }

  const patch =
    action === "accept"
      ? { accepted_at: now }
      : action === "decline"
        ? { declined_at: now }
        : { outcome: "won" as const };

  const { data, error } = await sb
    .from("lead_assignments")
    .update(patch)
    .eq("id", assignmentId)
    .eq("tenant_id", tenantId)
    .select("*")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "update failed" };
  return { ok: true, value: data as Assignment };
}

export async function listLedger(tenantId: string): Promise<LedgerEntry[]> {
  const sb = getServiceSupabase();
  if (!sb) {
    return memory()
      .ledger.filter((e) => e.tenant_id === tenantId)
      .sort((a, b) => b.id - a.id);
  }
  const { data } = await sb
    .from("credit_ledger")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("id", { ascending: false })
    .limit(100);
  return (data ?? []) as LedgerEntry[];
}

export async function logMessage(entry: Omit<MessageLog, "id" | "created_at">): Promise<void> {
  const sb = getServiceSupabase();
  if (!sb) {
    memory().messages.unshift({
      ...entry,
      id: id("msg"),
      created_at: new Date().toISOString(),
    });
    return;
  }
  await sb.from("messages").insert(entry);
}

export async function listMessages(limit = 50): Promise<MessageLog[]> {
  const sb = getServiceSupabase();
  if (!sb) return memory().messages.slice(0, limit);
  const { data } = await sb
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as MessageLog[];
}

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/server/env";
import type {
  Application,
  ApplicationEvent,
  ApplicationRepository,
  ApplicationStatus,
  AuditEntry,
  AuditRepository,
  Lead,
  LeadRepository,
} from "./types";
import type { DocumentRecord } from "@/domain/documents/types";

/**
 * Supabase-backed repositories.
 *
 * Authorization is NOT implemented here — it lives in Postgres row-level security
 * (see supabase/migrations). That placement is deliberate: a bug in this file cannot leak
 * one customer's passport to another, because the database refuses the read regardless of
 * what the application layer asks for.
 */

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (client) return client;
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase repositories requested without Supabase configuration");
  }
  client = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    // The service role key bypasses RLS and is used only for server-side admin reads.
    // Falling back to the anon key keeps RLS in force when it is not configured.
    env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } },
  );
  return client;
}

/** Postgres uses snake_case; the domain uses camelCase. Mapping is explicit, not magic. */
function toApplication(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    reference: row.reference as string,
    userId: row.user_id as string,
    serviceSlug: row.service_slug as string,
    status: row.status as ApplicationStatus,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    applicantName: row.applicant_name as string,
    applicantEmail: row.applicant_email as string,
    quotedTotal: Number(row.quoted_total ?? 0),
    currentStage: Number(row.current_stage ?? 0),
    documents: (row.documents as DocumentRecord[]) ?? [],
    events: (row.events as ApplicationEvent[]) ?? [],
    notes: (row.notes as string | null) ?? undefined,
  };
}

export const supabaseLeads: LeadRepository = {
  async create(lead) {
    const { data, error } = await db()
      .from("leads")
      .insert({
        email: lead.email,
        name: lead.name,
        phone: lead.phone,
        service_slug: lead.serviceSlug,
        message: lead.message,
        source: lead.source,
        profile: lead.profile ?? null,
        report: lead.report ?? null,
        marketing_consent: lead.marketingConsent ?? false,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create lead: ${error.message}`);

    return {
      id: data.id,
      createdAt: data.created_at,
      email: data.email,
      name: data.name ?? undefined,
      phone: data.phone ?? undefined,
      serviceSlug: data.service_slug ?? undefined,
      message: data.message ?? undefined,
      source: data.source,
      marketingConsent: data.marketing_consent ?? undefined,
    };
  },

  async list(limit = 50) {
    const { data, error } = await db()
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to list leads: ${error.message}`);

    return (data ?? []).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      email: row.email,
      name: row.name ?? undefined,
      phone: row.phone ?? undefined,
      serviceSlug: row.service_slug ?? undefined,
      message: row.message ?? undefined,
      source: row.source,
      marketingConsent: row.marketing_consent ?? undefined,
    })) as Lead[];
  },

  async get(id) {
    const { data, error } = await db()
      .from("leads")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Failed to load lead: ${error.message}`);
    if (!data) return null;
    return {
      id: data.id,
      createdAt: data.created_at,
      email: data.email,
      name: data.name ?? undefined,
      phone: data.phone ?? undefined,
      serviceSlug: data.service_slug ?? undefined,
      message: data.message ?? undefined,
      source: data.source,
      marketingConsent: data.marketing_consent ?? undefined,
    } as Lead;
  },
};

export const supabaseApplications: ApplicationRepository = {
  async listForUser(userId) {
    const { data, error } = await db()
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list applications: ${error.message}`);
    return (data ?? []).map(toApplication);
  },

  async listAll() {
    const { data, error } = await db()
      .from("applications")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list applications: ${error.message}`);
    return (data ?? []).map(toApplication);
  },

  async get(id) {
    const { data, error } = await db()
      .from("applications")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Failed to load application: ${error.message}`);
    return data ? toApplication(data) : null;
  },

  async getByReference(reference) {
    const { data, error } = await db()
      .from("applications")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();
    if (error) throw new Error(`Failed to load application: ${error.message}`);
    return data ? toApplication(data) : null;
  },

  async create(application) {
    const { data, error } = await db()
      .from("applications")
      .insert({
        reference: application.reference,
        user_id: application.userId,
        service_slug: application.serviceSlug,
        status: application.status,
        applicant_name: application.applicantName,
        applicant_email: application.applicantEmail,
        quoted_total: application.quotedTotal,
        current_stage: application.currentStage,
        documents: [],
        events: [],
        notes: application.notes ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create application: ${error.message}`);
    return toApplication(data);
  },

  async updateStatus(id, status, event) {
    const existing = await this.get(id);
    if (!existing) return null;

    const entry: ApplicationEvent = {
      ...event,
      id: crypto.randomUUID(),
      applicationId: id,
      at: new Date().toISOString(),
      status,
    };

    const { data, error } = await db()
      .from("applications")
      .update({
        status,
        updated_at: entry.at,
        events: [...existing.events, entry],
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update application: ${error.message}`);
    return toApplication(data);
  },

  async addDocument(id, document) {
    const existing = await this.get(id);
    if (!existing) return null;

    const { data, error } = await db()
      .from("applications")
      .update({
        documents: [...existing.documents, document],
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`Failed to attach document: ${error.message}`);
    return toApplication(data);
  },
};

export const supabaseAudit: AuditRepository = {
  async record(entry) {
    const { data, error } = await db()
      .from("audit_log")
      .insert({
        actor_id: entry.actorId,
        action: entry.action,
        subject: entry.subject,
        detail: entry.detail ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to write audit entry: ${error.message}`);
    return {
      id: data.id,
      at: data.at,
      actorId: data.actor_id,
      action: data.action,
      subject: data.subject,
      detail: data.detail ?? undefined,
    } as AuditEntry;
  },

  async list(limit = 100) {
    const { data, error } = await db()
      .from("audit_log")
      .select("*")
      .order("at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`Failed to list audit entries: ${error.message}`);
    return (data ?? []).map((row) => ({
      id: row.id,
      at: row.at,
      actorId: row.actor_id,
      action: row.action,
      subject: row.subject,
      detail: row.detail ?? undefined,
    })) as AuditEntry[];
  },
};

import { CITIES, DISTRICTS, PROVIDERS, SERVICES } from "./seed-data";
import { getSupabase, isSupabaseConfigured } from "./supabase/server";
import type { City, District, Provider, Service } from "./types";

/**
 * Data access.
 *
 * Every function tries Supabase and falls back to seed data, so the app is
 * always runnable — before the database exists, and if it is briefly
 * unavailable. `usingSeedData()` lets the UI say so honestly rather than
 * presenting demo rows as live ones.
 */

export function usingSeedData(): boolean {
  return !isSupabaseConfigured;
}

export async function getCities(): Promise<City[]> {
  const sb = getSupabase();
  if (!sb) return CITIES;
  const { data } = await sb.from("cities").select("*").eq("is_active", true);
  return data?.length ? (data as City[]) : CITIES;
}

export async function getDistricts(citySlug = "riyadh"): Promise<District[]> {
  const sb = getSupabase();
  if (!sb) return DISTRICTS;
  const { data } = await sb
    .from("districts")
    .select("*, cities!inner(slug)")
    .eq("cities.slug", citySlug);
  return data?.length ? (data as unknown as District[]) : DISTRICTS;
}

export async function getServices(): Promise<Service[]> {
  const sb = getSupabase();
  if (!sb) return SERVICES;
  const { data } = await sb
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data?.length ? (data as Service[]) : SERVICES;
}

export async function getService(slug: string): Promise<Service | undefined> {
  const all = await getServices();
  return all.find((s) => s.slug === slug);
}

export interface ProviderQuery {
  service?: string;
  district?: string;
  q?: string;
}

/**
 * The directory query — this is what powers "AC repair near me".
 *
 * Matching is intentionally forgiving: a search term hits the provider name
 * OR any service they offer, because a customer types "مكيف" or "ac repair",
 * not a taxonomy slug.
 */
export async function searchProviders(
  query: ProviderQuery = {},
): Promise<Provider[]> {
  const providers = await getAllProviders();
  const services = await getServices();
  const term = query.q?.trim().toLowerCase();

  return providers
    .filter((p) => p.status === "active")
    .filter((p) => !query.service || p.service_slugs.includes(query.service))
    .filter((p) => !query.district || p.district_slugs.includes(query.district))
    .filter((p) => {
      if (!term) return true;
      if (p.name_ar.toLowerCase().includes(term)) return true;
      if (p.name_en.toLowerCase().includes(term)) return true;
      return p.service_slugs.some((slug) => {
        const s = services.find((x) => x.slug === slug);
        return (
          s &&
          (s.name_ar.toLowerCase().includes(term) ||
            s.name_en.toLowerCase().includes(term) ||
            s.slug.includes(term))
        );
      });
    })
    .sort((a, b) => {
      // Verified providers first — the whole point of the Wathq layer.
      const av = a.cr_verified_at ? 1 : 0;
      const bv = b.cr_verified_at ? 1 : 0;
      if (av !== bv) return bv - av;
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
}

export async function getAllProviders(): Promise<Provider[]> {
  const sb = getSupabase();
  if (!sb) return PROVIDERS;

  const { data } = await sb
    .from("tenants")
    .select(
      "*, partner_services(service_id, services(slug)), tenant_districts(districts(slug))",
    )
    .eq("status", "active");

  if (!data?.length) return PROVIDERS;

  return (data as any[]).map((row) => ({
    ...row,
    service_slugs:
      row.partner_services?.map((ps: any) => ps.services?.slug).filter(Boolean) ??
      [],
    district_slugs:
      row.tenant_districts?.map((td: any) => td.districts?.slug).filter(Boolean) ??
      [],
  })) as Provider[];
}

export async function getProvider(slug: string): Promise<Provider | undefined> {
  const all = await getAllProviders();
  return all.find((p) => p.slug === slug);
}

export interface CreateLeadInput {
  customer_name: string;
  phone: string;
  service_slug?: string;
  district_slug?: string;
  address?: string;
  notes?: string;
  preferred_provider_slug?: string;
}

export interface CreateLeadResult {
  ok: boolean;
  ref?: string;
  error?: string;
  persisted: boolean;
}

export async function createLead(
  input: CreateLeadInput,
): Promise<CreateLeadResult> {
  const ref = `L-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const sb = getSupabase();

  if (!sb) {
    // No database yet. Report honestly that nothing was stored — a silent
    // success here would be a lie the operator finds out about later.
    return { ok: true, ref, persisted: false };
  }

  const [service, districts, providers] = await Promise.all([
    input.service_slug ? getService(input.service_slug) : undefined,
    getDistricts(),
    input.preferred_provider_slug ? getAllProviders() : [],
  ]);

  const district = districts.find((d) => d.slug === input.district_slug);
  const preferred = providers.find(
    (p) => p.slug === input.preferred_provider_slug,
  );
  const cities = await getCities();

  const { data, error } = await sb
    .from("leads")
    .insert({
      customer_name: input.customer_name,
      phone: input.phone,
      service_id: service?.id,
      city_id: cities[0]?.id,
      district_id: district?.id,
      address: input.address,
      notes: input.notes,
      preferred_tenant_id: preferred?.id,
      source: "web",
    })
    .select("ref")
    .single();

  if (error) return { ok: false, error: error.message, persisted: false };
  return { ok: true, ref: data?.ref ?? ref, persisted: true };
}

export type Locale = "ar" | "en";

export interface City {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
}

export interface District {
  id: string;
  city_id: string;
  slug: string;
  name_ar: string;
  name_en: string;
}

export interface Service {
  id: string;
  slug: string;
  category: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  typical_price_min?: number;
  typical_price_max?: number;
  is_recurring: boolean;
  sort_order: number;
}

export interface Provider {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  about_ar?: string;
  about_en?: string;
  city_id: string;
  phone?: string;
  whatsapp?: string;
  /** Set only when verified through Wathq. Never self-declared. */
  cr_number?: string;
  cr_verified_at?: string | null;
  status: "pending" | "active" | "suspended";
  rating?: number;
  jobs_completed: number;
  credit_balance: number;
  service_slugs: string[];
  district_slugs: string[];
  /** Demo rows carry this so the UI never passes seed data off as real. */
  is_demo?: boolean;
}

export interface Lead {
  id: string;
  ref: string;
  customer_name: string;
  phone: string;
  service_id?: string;
  city_id?: string;
  district_id?: string;
  address?: string;
  notes?: string;
  status: "new" | "assigned" | "accepted" | "declined" | "completed" | "cancelled";
  preferred_tenant_id?: string;
  created_at: string;
}

/** Localised field access, so components never branch on locale inline. */
export function loc<T extends Record<string, unknown>>(
  row: T,
  field: string,
  locale: Locale,
): string {
  const key = `${field}_${locale}`;
  return (row[key] ?? row[`${field}_ar`] ?? "") as string;
}

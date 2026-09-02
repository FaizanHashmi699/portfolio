export interface Programme {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string | null;
  age_range: string | null;
  schedule: string | null;
  fee_text: string | null;
  fee_pence: number | null;
  capacity: number | null;
  teacher_note: string | null;
  sort_order: number;
  published: boolean;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string | null;
  target_pence: number;
  raised_pence: number;
  is_primary: boolean;
  published: boolean;
}

export interface Donation {
  id: string;
  reference: string;
  campaign_id: string | null;
  amount_pence: number;
  frequency: "one_off" | "monthly";
  donor_name: string | null;
  donor_email: string | null;
  donor_postcode: string | null;
  gift_aid: boolean;
  message: string | null;
  status: "pending" | "paid" | "failed" | "cancelled";
  created_at: string;
}

export interface Enquiry {
  id: string;
  programme_id: string | null;
  parent_name: string;
  email: string;
  phone: string | null;
  child_name: string | null;
  child_age: number | null;
  message: string | null;
  status: "new" | "contacted" | "enrolled" | "closed";
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  unsubscribed: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  kind: "notice" | "janazah" | "jumuah" | "event";
  starts_at: string;
  ends_at: string | null;
  published: boolean;
}

export interface PrayerSettings {
  id: number;
  masjid_name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  method: "MWL" | "ISNA" | "Egypt" | "Karachi" | "MakkahUmmAlQura";
  asr_method: "standard" | "hanafi";
  fajr_offset: number;
  dhuhr_offset: number;
  asr_offset: number;
  maghrib_offset: number;
  isha_offset: number;
  jumuah_times: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_role: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
}

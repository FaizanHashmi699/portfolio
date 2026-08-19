import type { ApplicantProfile, EligibilityReport } from "@/domain/eligibility/types";
import type { DocumentRecord } from "@/domain/documents/types";

export type ApplicationStatus =
  | "draft"
  | "documents-pending"
  | "in-review"
  | "submitted"
  | "with-authority"
  | "approved"
  | "rejected"
  | "cancelled";

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  at: string;
  title: string;
  description: string;
  actor: "customer" | "maqam" | "government" | "system";
  status?: ApplicationStatus;
}

export interface Application {
  id: string;
  reference: string;
  userId: string;
  serviceSlug: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  applicantName: string;
  applicantEmail: string;
  /** Total quoted, in AED including VAT. Frozen at the moment of quoting. */
  quotedTotal: number;
  /** Index of the current stage within the service's stage list. */
  currentStage: number;
  documents: DocumentRecord[];
  events: ApplicationEvent[];
  notes?: string;
}

export interface Lead {
  id: string;
  createdAt: string;
  email: string;
  name?: string;
  phone?: string;
  serviceSlug?: string;
  message?: string;
  source: "eligibility" | "contact" | "quote";
  profile?: ApplicantProfile;
  report?: EligibilityReport;
  /** Consent to be contacted. Absent means we may only send the report itself. */
  marketingConsent?: boolean;
}

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  action: string;
  subject: string;
  detail?: string;
}

export interface LeadRepository {
  create(lead: Omit<Lead, "id" | "createdAt">): Promise<Lead>;
  list(limit?: number): Promise<Lead[]>;
  get(id: string): Promise<Lead | null>;
}

export interface ApplicationRepository {
  listForUser(userId: string): Promise<Application[]>;
  listAll(): Promise<Application[]>;
  get(id: string): Promise<Application | null>;
  getByReference(reference: string): Promise<Application | null>;
  create(
    application: Omit<Application, "id" | "createdAt" | "updatedAt" | "events" | "documents">,
  ): Promise<Application>;
  updateStatus(
    id: string,
    status: ApplicationStatus,
    event: Omit<ApplicationEvent, "id" | "applicationId" | "at">,
  ): Promise<Application | null>;
  addDocument(id: string, document: DocumentRecord): Promise<Application | null>;
}

export interface AuditRepository {
  record(entry: Omit<AuditEntry, "id" | "at">): Promise<AuditEntry>;
  list(limit?: number): Promise<AuditEntry[]>;
}

export interface Repositories {
  leads: LeadRepository;
  applications: ApplicationRepository;
  audit: AuditRepository;
  /** Which adapter is active. Surfaced in the admin console so it is never ambiguous. */
  driver: "in-memory" | "supabase";
}

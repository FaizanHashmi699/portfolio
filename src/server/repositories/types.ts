import type { ApplicantProfile, EligibilityReport } from "@/domain/eligibility/types";
import type { DocumentRecord } from "@/domain/documents/types";
import type { FeeLine } from "@/domain/catalog/types";

export type ApplicationStatus =
  | "draft"
  | "documents-pending"
  | "in-review"
  | "submitted"
  | "with-authority"
  | "approved"
  | "rejected"
  | "cancelled";

/** Statuses after which the file is closed and document risk is no longer meaningful. */
export const TERMINAL_STATUSES = ["approved", "rejected", "cancelled"] as const;

export function isTerminal(status: ApplicationStatus): boolean {
  return (TERMINAL_STATUSES as readonly string[]).includes(status);
}

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
    application: Omit<
      Application,
      "id" | "createdAt" | "updatedAt" | "events" | "documents"
    >,
  ): Promise<Application>;
  updateStatus(
    id: string,
    status: ApplicationStatus,
    event: Omit<ApplicationEvent, "id" | "applicationId" | "at">,
  ): Promise<Application | null>;
  addDocument(id: string, document: DocumentRecord): Promise<Application | null>;
  reviewDocument(
    id: string,
    documentId: string,
    review: Pick<
      DocumentRecord,
      "reviewedAt" | "reviewedBy" | "reviewNote" | "reviewDecision"
    >,
  ): Promise<Application | null>;
}

export interface AuditRepository {
  record(entry: Omit<AuditEntry, "id" | "at">): Promise<AuditEntry>;
  list(limit?: number): Promise<AuditEntry[]>;
}

// ── Messages ────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  applicationId: string;
  at: string;
  authorId: string;
  authorName: string;
  authorRole: "customer" | "staff";
  body: string;
  readByCustomer: boolean;
  readByStaff: boolean;
}

// ── Invoices ────────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export interface Invoice {
  id: string;
  reference: string;
  applicationId: string;
  userId: string;
  issuedAt: string;
  dueAt: string;
  status: InvoiceStatus;
  paidAt?: string;
  /** The same itemised lines the quote was built from. An invoice that cannot be
   *  reconciled against the published quote would defeat the entire positioning. */
  lines: FeeLine[];
  subtotal: number;
  vat: number;
  total: number;
  /** Which part of the process this invoice covers, e.g. "Service fee" or "Government fees". */
  description: string;
}

// ── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  at: string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  kind: "status" | "document" | "message" | "invoice" | "reminder";
}

export interface MessageRepository {
  listForApplication(applicationId: string): Promise<Message[]>;
  create(message: Omit<Message, "id" | "at">): Promise<Message>;
  markRead(applicationId: string, reader: "customer" | "staff"): Promise<void>;
  unreadCountForUser(userId: string): Promise<number>;
}

export interface InvoiceRepository {
  listForUser(userId: string): Promise<Invoice[]>;
  listForApplication(applicationId: string): Promise<Invoice[]>;
  listAll(): Promise<Invoice[]>;
  get(id: string): Promise<Invoice | null>;
  create(invoice: Omit<Invoice, "id" | "issuedAt">): Promise<Invoice>;
  updateStatus(id: string, status: InvoiceStatus): Promise<Invoice | null>;
}

export interface NotificationRepository {
  listForUser(userId: string, limit?: number): Promise<Notification[]>;
  create(notification: Omit<Notification, "id" | "at" | "read">): Promise<Notification>;
  markAllRead(userId: string): Promise<void>;
  unreadCount(userId: string): Promise<number>;
}

// ── People ──────────────────────────────────────────────────────────────────

export type PersonRole = "customer" | "staff" | "admin";

export interface Person {
  id: string;
  email: string;
  fullName: string;
  role: PersonRole;
  createdAt: string;
  phone?: string;
  nationality?: string;
}

export interface PersonRepository {
  list(role?: PersonRole): Promise<Person[]>;
  get(id: string): Promise<Person | null>;
  updateRole(id: string, role: PersonRole): Promise<Person | null>;
}

export interface Repositories {
  leads: LeadRepository;
  applications: ApplicationRepository;
  messages: MessageRepository;
  invoices: InvoiceRepository;
  notifications: NotificationRepository;
  people: PersonRepository;
  audit: AuditRepository;
  /** Which adapter is active. Surfaced in the admin console so it is never ambiguous. */
  driver: "in-memory" | "supabase";
}

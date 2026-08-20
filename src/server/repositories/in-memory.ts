import { randomUUID } from "node:crypto";
import type {
  Application,
  ApplicationEvent,
  ApplicationRepository,
  ApplicationStatus,
  AuditEntry,
  AuditRepository,
  Invoice,
  InvoiceRepository,
  InvoiceStatus,
  Lead,
  LeadRepository,
  Message,
  MessageRepository,
  Notification,
  NotificationRepository,
  Person,
  PersonRepository,
  PersonRole,
} from "./types";
import type { DocumentRecord } from "@/domain/documents/types";
import {
  seedApplications,
  seedInvoices,
  seedLeads,
  seedMessages,
  seedNotifications,
  seedPeople,
} from "./seed";

/**
 * In-memory repositories, seeded with demo data.
 *
 * Used whenever Supabase credentials are absent — which means `npm install && npm run dev`
 * produces a fully working product on a laptop with no accounts. These are not stubs that
 * return empty arrays: they implement the same interface with the same semantics as the
 * Supabase adapter, so a test that passes here is testing real behaviour.
 *
 * State lives on globalThis so Next's dev-mode module reloading doesn't reset it mid-session.
 */

interface Store {
  applications: Application[];
  leads: Lead[];
  messages: Message[];
  invoices: Invoice[];
  notifications: Notification[];
  people: Person[];
  audit: AuditEntry[];
}

function freshStore(): Store {
  return {
    applications: seedApplications(),
    leads: seedLeads(),
    messages: seedMessages(),
    invoices: seedInvoices(),
    notifications: seedNotifications(),
    people: seedPeople(),
    audit: [],
  };
}

const globalStore = globalThis as typeof globalThis & { __maqamStore?: Store };

function store(): Store {
  globalStore.__maqamStore ??= freshStore();
  return globalStore.__maqamStore;
}

/** Exposed for tests, which need a clean slate between cases. */
export function resetInMemoryStore(): void {
  globalStore.__maqamStore = freshStore();
}

const clone = <T>(value: T): T => structuredClone(value);

export const inMemoryLeads: LeadRepository = {
  async create(lead) {
    const created: Lead = {
      ...lead,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    store().leads.unshift(created);
    return clone(created);
  },
  async list(limit = 50) {
    return clone(store().leads.slice(0, limit));
  },
  async get(id) {
    return clone(store().leads.find((l) => l.id === id) ?? null);
  },
};

export const inMemoryApplications: ApplicationRepository = {
  async listForUser(userId) {
    return clone(
      store()
        .applications.filter((a) => a.userId === userId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    );
  },
  async listAll() {
    return clone(
      [...store().applications].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    );
  },
  async get(id) {
    return clone(store().applications.find((a) => a.id === id) ?? null);
  },
  async getByReference(reference) {
    return clone(store().applications.find((a) => a.reference === reference) ?? null);
  },
  async create(application) {
    const now = new Date().toISOString();
    const created: Application = {
      ...application,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      documents: [],
      events: [
        {
          id: randomUUID(),
          applicationId: "",
          at: now,
          title: "Application created",
          description: `${application.serviceSlug} started.`,
          actor: "customer",
          status: application.status,
        },
      ],
    };
    created.events[0].applicationId = created.id;
    store().applications.unshift(created);
    return clone(created);
  },
  async updateStatus(id, status: ApplicationStatus, event) {
    const application = store().applications.find((a) => a.id === id);
    if (!application) return null;

    const entry: ApplicationEvent = {
      ...event,
      id: randomUUID(),
      applicationId: id,
      at: new Date().toISOString(),
      status,
    };
    application.status = status;
    application.updatedAt = entry.at;
    application.events.push(entry);
    return clone(application);
  },
  async addDocument(id, document: DocumentRecord) {
    const application = store().applications.find((a) => a.id === id);
    if (!application) return null;
    application.documents.push(document);
    application.updatedAt = new Date().toISOString();
    return clone(application);
  },
  async reviewDocument(id, documentId, review) {
    const application = store().applications.find((a) => a.id === id);
    if (!application) return null;
    const document = application.documents.find((d) => d.id === documentId);
    if (!document) return null;
    Object.assign(document, review);
    application.updatedAt = new Date().toISOString();
    return clone(application);
  },
};

export const inMemoryAudit: AuditRepository = {
  async record(entry) {
    const created: AuditEntry = {
      ...entry,
      id: randomUUID(),
      at: new Date().toISOString(),
    };
    store().audit.unshift(created);
    return clone(created);
  },
  async list(limit = 100) {
    return clone(store().audit.slice(0, limit));
  },
};

export const inMemoryMessages: MessageRepository = {
  async listForApplication(applicationId) {
    return clone(
      store()
        .messages.filter((m) => m.applicationId === applicationId)
        .sort((a, b) => a.at.localeCompare(b.at)),
    );
  },
  async create(message) {
    const created: Message = {
      ...message,
      id: randomUUID(),
      at: new Date().toISOString(),
    };
    store().messages.push(created);
    return clone(created);
  },
  async markRead(applicationId, reader) {
    for (const message of store().messages) {
      if (message.applicationId !== applicationId) continue;
      if (reader === "customer") message.readByCustomer = true;
      else message.readByStaff = true;
    }
  },
  async unreadCountForUser(userId) {
    const owned = new Set(
      store()
        .applications.filter((a) => a.userId === userId)
        .map((a) => a.id),
    );
    // A customer's unread messages are the ones staff wrote, and vice versa.
    return store().messages.filter(
      (m) =>
        owned.has(m.applicationId) && m.authorRole === "staff" && !m.readByCustomer,
    ).length;
  },
};

export const inMemoryInvoices: InvoiceRepository = {
  async listForUser(userId) {
    return clone(
      store()
        .invoices.filter((i) => i.userId === userId)
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    );
  },
  async listForApplication(applicationId) {
    return clone(
      store()
        .invoices.filter((i) => i.applicationId === applicationId)
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    );
  },
  async listAll() {
    return clone(
      [...store().invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    );
  },
  async get(id) {
    return clone(store().invoices.find((i) => i.id === id) ?? null);
  },
  async create(invoice) {
    const created: Invoice = {
      ...invoice,
      id: randomUUID(),
      issuedAt: new Date().toISOString(),
    };
    store().invoices.unshift(created);
    return clone(created);
  },
  async updateStatus(id, status: InvoiceStatus) {
    const invoice = store().invoices.find((i) => i.id === id);
    if (!invoice) return null;
    invoice.status = status;
    if (status === "paid") invoice.paidAt = new Date().toISOString();
    return clone(invoice);
  },
};

export const inMemoryNotifications: NotificationRepository = {
  async listForUser(userId, limit = 30) {
    return clone(
      store()
        .notifications.filter((n) => n.userId === userId)
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, limit),
    );
  },
  async create(notification) {
    const created: Notification = {
      ...notification,
      id: randomUUID(),
      at: new Date().toISOString(),
      read: false,
    };
    store().notifications.unshift(created);
    return clone(created);
  },
  async markAllRead(userId) {
    for (const notification of store().notifications) {
      if (notification.userId === userId) notification.read = true;
    }
  },
  async unreadCount(userId) {
    return store().notifications.filter((n) => n.userId === userId && !n.read).length;
  },
};

export const inMemoryPeople: PersonRepository = {
  async list(role) {
    const all = store().people;
    return clone(
      (role ? all.filter((p) => p.role === role) : all).sort((a, b) =>
        a.fullName.localeCompare(b.fullName),
      ),
    );
  },
  async get(id) {
    return clone(store().people.find((p) => p.id === id) ?? null);
  },
  async updateRole(id, role: PersonRole) {
    const person = store().people.find((p) => p.id === id);
    if (!person) return null;
    person.role = role;
    return clone(person);
  },
};

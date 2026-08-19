import { randomUUID } from "node:crypto";
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
import { seedApplications, seedLeads } from "./seed";

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
  audit: AuditEntry[];
}

const globalStore = globalThis as typeof globalThis & { __maqamStore?: Store };

function store(): Store {
  if (!globalStore.__maqamStore) {
    globalStore.__maqamStore = {
      applications: seedApplications(),
      leads: seedLeads(),
      audit: [],
    };
  }
  return globalStore.__maqamStore;
}

/** Exposed for tests, which need a clean slate between cases. */
export function resetInMemoryStore(): void {
  globalStore.__maqamStore = {
    applications: seedApplications(),
    leads: seedLeads(),
    audit: [],
  };
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

import type { Application, Invoice, Lead, Message, Notification } from "./types";

/**
 * Demo data for the zero-key local run.
 *
 * These are realistic enough to exercise every UI state — a blocked file, one waiting on
 * the government, one approved, one just started — so the portal and admin console can be
 * developed and tested without a database or any credentials.
 */

export const DEMO_USER_ID = "demo-user-1";

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export function seedApplications(): Application[] {
  return [
    {
      id: "app-1",
      reference: "MQ-2026-0417",
      userId: DEMO_USER_ID,
      serviceSlug: "employment-visa-mainland",
      status: "with-authority",
      createdAt: daysAgo(12),
      updatedAt: daysAgo(2),
      applicantName: "Amina Yusuf",
      applicantEmail: "amina@example.com",
      quotedTotal: 6848,
      currentStage: 3,
      documents: [
        {
          id: "doc-1",
          kind: "passport",
          fileName: "passport.pdf",
          uploadedAt: daysAgo(12),
          sizeBytes: 820_000,
          mimeType: "application/pdf",
          fields: {
            fullName: "Amina Yusuf",
            expiryDate: "2031-04-02",
            blankPages: 8,
          },
        },
        {
          id: "doc-1b",
          kind: "photo",
          fileName: "photo.jpg",
          uploadedAt: daysAgo(12),
          sizeBytes: 240_000,
          mimeType: "image/jpeg",
          fields: {
            fullName: "Amina Yusuf",
            backgroundIsWhite: true,
            faceRatio: 0.75,
          },
        },
        {
          id: "offer",
          kind: "employment-offer",
          fileName: "offer-letter.pdf",
          uploadedAt: daysAgo(12),
          sizeBytes: 310_000,
          mimeType: "application/pdf",
          fields: { fullName: "Amina Yusuf" },
        },
        {
          id: "doc-2",
          kind: "degree",
          fileName: "degree-attested.pdf",
          uploadedAt: daysAgo(11),
          sizeBytes: 1_400_000,
          mimeType: "application/pdf",
          fields: {
            fullName: "Amina Yusuf",
            attestationStamps: ["notary", "home-mofa", "uae-embassy", "uae-mofa"],
          },
        },
      ],
      events: [
        {
          id: "ev-1",
          applicationId: "app-1",
          at: daysAgo(12),
          title: "Application created",
          description: "Mainland employment visa started.",
          actor: "customer",
          status: "draft",
        },
        {
          id: "ev-2",
          applicationId: "app-1",
          at: daysAgo(11),
          title: "Documents validated",
          description: "All documents passed pre-submission checks with no blockers.",
          actor: "maqam",
          status: "in-review",
        },
        {
          id: "ev-3",
          applicationId: "app-1",
          at: daysAgo(9),
          title: "Work permit submitted to MoHRE",
          description: "Quota confirmed and offer letter lodged.",
          actor: "maqam",
          status: "submitted",
        },
        {
          id: "ev-4",
          applicationId: "app-1",
          at: daysAgo(2),
          title: "Under review by MoHRE",
          description:
            "Automated screening complete, now with a case officer. No action needed from you.",
          actor: "government",
          status: "with-authority",
        },
      ],
    },
    {
      id: "app-2",
      reference: "MQ-2026-0431",
      userId: DEMO_USER_ID,
      serviceSlug: "family-sponsorship-visa",
      status: "documents-pending",
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
      applicantName: "Omar Yusuf",
      applicantEmail: "amina@example.com",
      quotedTotal: 4324,
      currentStage: 1,
      documents: [
        {
          id: "doc-3",
          kind: "passport",
          fileName: "omar-passport.jpg",
          uploadedAt: daysAgo(4),
          sizeBytes: 640_000,
          mimeType: "image/jpeg",
          fields: {
            fullName: "Omar Yusuf",
            expiryDate: "2026-11-20",
            blankPages: 3,
          },
        },
        {
          id: "doc-4",
          kind: "marriage-certificate",
          fileName: "marriage-cert.pdf",
          uploadedAt: daysAgo(3),
          sizeBytes: 900_000,
          mimeType: "application/pdf",
          fields: {
            fullName: "Omar Yusuf",
            attestationStamps: ["notary", "home-mofa"],
          },
        },
      ],
      events: [
        {
          id: "ev-5",
          applicationId: "app-2",
          at: daysAgo(4),
          title: "Application created",
          description: "Spouse sponsorship started.",
          actor: "customer",
          status: "draft",
        },
        {
          id: "ev-6",
          applicationId: "app-2",
          at: daysAgo(1),
          title: "Two issues found in your documents",
          description:
            "Passport validity is under 6 months and the marriage certificate attestation chain is incomplete. Both are fixable — see your document list.",
          actor: "system",
          status: "documents-pending",
        },
      ],
    },
    {
      id: "app-3",
      reference: "MQ-2026-0388",
      userId: DEMO_USER_ID,
      serviceSlug: "tourist-visa-30-day",
      status: "approved",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(26),
      applicantName: "Layla Haddad",
      applicantEmail: "amina@example.com",
      quotedTotal: 406,
      currentStage: 4,
      documents: [],
      events: [
        {
          id: "ev-7",
          applicationId: "app-3",
          at: daysAgo(30),
          title: "Application created",
          description: "30-day tourist visa started.",
          actor: "customer",
          status: "draft",
        },
        {
          id: "ev-8",
          applicationId: "app-3",
          at: daysAgo(29),
          title: "Submitted to ICP",
          description: "Application lodged.",
          actor: "maqam",
          status: "submitted",
        },
        {
          id: "ev-9",
          applicationId: "app-3",
          at: daysAgo(26),
          title: "Visa issued",
          description: "E-visa delivered by email and available in your portal.",
          actor: "government",
          status: "approved",
        },
      ],
    },
  ];
}

export function seedLeads(): Lead[] {
  return [
    {
      id: "lead-1",
      createdAt: daysAgo(1),
      email: "priya@example.com",
      name: "Priya Nair",
      serviceSlug: "golden-visa",
      source: "eligibility",
      marketingConsent: true,
    },
    {
      id: "lead-2",
      createdAt: daysAgo(3),
      email: "james@example.com",
      name: "James Okoro",
      serviceSlug: "free-zone-company-setup",
      message: "Looking to set up a consultancy licence, which zone is cheapest?",
      source: "contact",
    },
  ];
}

export function seedMessages(): Message[] {
  return [
    {
      id: "msg-1",
      applicationId: "app-2",
      at: daysAgo(1),
      authorId: "demo-admin-1",
      authorName: "Rashid (Maqam)",
      authorRole: "staff",
      body: "Hi Amina — our checks flagged two things on Omar's file. His passport expires in under six months, and the marriage certificate is only attested to the Egyptian MOFA stage. Both are fixable, and it's much cheaper to fix them now than after we've paid the government fee. Happy to walk you through either.",
      readByCustomer: false,
      readByStaff: true,
    },
    {
      id: "msg-2",
      applicationId: "app-1",
      at: daysAgo(2),
      authorId: "demo-admin-1",
      authorName: "Rashid (Maqam)",
      authorRole: "staff",
      body: "Your file cleared MoHRE's automated screening this morning and is now with a case officer. Nothing needed from you — I'll update you the moment it moves.",
      readByCustomer: true,
      readByStaff: true,
    },
    {
      id: "msg-3",
      applicationId: "app-1",
      at: daysAgo(2),
      authorId: DEMO_USER_ID,
      authorName: "Amina Yusuf",
      authorRole: "customer",
      body: "Thank you — is there anything I should prepare for the medical while we wait?",
      readByCustomer: true,
      readByStaff: true,
    },
  ];
}

export function seedInvoices(): Invoice[] {
  return [
    {
      id: "inv-1",
      reference: "INV-2026-0417",
      applicationId: "app-1",
      userId: DEMO_USER_ID,
      issuedAt: daysAgo(12),
      dueAt: daysAgo(5),
      status: "paid",
      paidAt: daysAgo(11),
      description: "Service fee — mainland employment visa",
      lines: [
        {
          kind: "service",
          label: "Maqam service fee",
          amount: 1800,
          vatable: true,
          note: "MoHRE and ICP handling, document validation, appointment coordination.",
        },
      ],
      subtotal: 1800,
      vat: 90,
      total: 1890,
    },
    {
      id: "inv-2",
      reference: "INV-2026-0418",
      applicationId: "app-1",
      userId: DEMO_USER_ID,
      issuedAt: daysAgo(9),
      dueAt: daysAgo(2),
      status: "paid",
      paidAt: daysAgo(9),
      description: "Government and third-party fees — passed through at cost",
      lines: [
        {
          kind: "government",
          label: "MoHRE work permit",
          amount: 2000,
          vatable: false,
        },
        { kind: "government", label: "Entry permit", amount: 500, vatable: false },
        {
          kind: "third-party",
          label: "Medical fitness test",
          amount: 320,
          vatable: true,
        },
      ],
      subtotal: 2820,
      vat: 16,
      total: 2836,
    },
    {
      id: "inv-3",
      reference: "INV-2026-0431",
      applicationId: "app-2",
      userId: DEMO_USER_ID,
      issuedAt: daysAgo(4),
      dueAt: daysAgo(-10),
      status: "sent",
      description: "Service fee — spouse sponsorship",
      lines: [
        {
          kind: "service",
          label: "Maqam service fee",
          amount: 1200,
          vatable: true,
          note: "Eligibility check, document preparation and submission.",
        },
      ],
      subtotal: 1200,
      vat: 60,
      total: 1260,
    },
  ];
}

export function seedNotifications(): Notification[] {
  return [
    {
      id: "notif-1",
      userId: DEMO_USER_ID,
      at: daysAgo(1),
      title: "Two issues found on MQ-2026-0431",
      body: "Passport validity and an incomplete attestation chain. Both fixable.",
      href: "/portal/applications/app-2",
      read: false,
      kind: "document",
    },
    {
      id: "notif-2",
      userId: DEMO_USER_ID,
      at: daysAgo(1),
      title: "New message from Rashid",
      body: "About the documents on Omar's sponsorship application.",
      href: "/portal/applications/app-2",
      read: false,
      kind: "message",
    },
    {
      id: "notif-3",
      userId: DEMO_USER_ID,
      at: daysAgo(2),
      title: "MQ-2026-0417 is with the authority",
      body: "Cleared automated screening and is now with a case officer.",
      href: "/portal/applications/app-1",
      read: true,
      kind: "status",
    },
  ];
}

import { describe, expect, it } from "vitest";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  organizationJsonLd,
  serviceJsonLd,
  websiteJsonLd,
} from "../seo";
import { getService, services } from "@/domain/catalog/services";
import { buildQuote } from "@/domain/pricing/quote";
import { homeFaqs } from "@/content/faqs";

describe("organizationJsonLd", () => {
  it("describes us as a professional service, not a government body", () => {
    const data = organizationJsonLd();
    expect(data["@type"]).toBe("ProfessionalService");
    expect(JSON.stringify(data)).not.toMatch(/GovernmentOffice|GovernmentOrganization/);
  });

  it("carries the contact details a rich result needs", () => {
    const data = organizationJsonLd();
    expect(data.email).toBeTruthy();
    expect(data.telephone).toBeTruthy();
    expect(data.address.addressCountry).toBe("AE");
  });
});

describe("websiteJsonLd", () => {
  it("points at the organization node", () => {
    expect(websiteJsonLd().publisher["@id"]).toBe(organizationJsonLd()["@id"]);
  });
});

describe("serviceJsonLd", () => {
  it("publishes the real total, not a teaser figure", () => {
    const service = getService("golden-visa")!;
    const data = serviceJsonLd(service);
    expect(data.offers.price).toBe(buildQuote(service).total);
    expect(data.offers.priceCurrency).toBe("AED");
  });

  it("produces valid structured data for every service", () => {
    for (const service of services) {
      const data = serviceJsonLd(service);
      expect(data["@type"]).toBe("Service");
      expect(data.name).toBe(service.name);
      expect(data.url).toContain(service.slug);
      expect(data.offers.price).toBeGreaterThan(0);
    }
  });
});

describe("faqJsonLd", () => {
  it("maps each question to an answered entity", () => {
    const data = faqJsonLd(homeFaqs);
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toHaveLength(homeFaqs.length);
    expect(data.mainEntity[0].acceptedAnswer.text).toBe(homeFaqs[0].answer);
  });

  it("never makes a claim of guaranteed approval in structured data", () => {
    // Note the FAQ legitimately warns *against* firms promising guarantees, so this
    // matches first-person claims rather than the word "guarantee" appearing at all.
    const serialised = JSON.stringify(faqJsonLd(homeFaqs)).toLowerCase();
    expect(serialised).not.toMatch(
      /we guarantee|we can guarantee|approval is guaranteed|your visa will be approved/,
    );
  });

  it("states plainly that no outcome can be guaranteed", () => {
    const serialised = JSON.stringify(faqJsonLd(homeFaqs)).toLowerCase();
    expect(serialised).toMatch(/no, and neither can anyone else/);
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers positions from one, in order", () => {
    const data = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
    ]);
    expect(data.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(data.itemListElement[1].item).toContain("/services");
  });
});

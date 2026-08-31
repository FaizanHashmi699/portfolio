# Manarat Foundation — Competitor & Market Research

Competitive research project for **[manaratfoundation.org.uk](https://manaratfoundation.org.uk/)** (Manarat Foundation,
registered charity 1148223, 155 Coventry Road, Sheldon, Birmingham).

> **This directory is self-contained.** It does not touch `index.html`, `style.css` or anything
> else belonging to the portfolio coursework in the repository root.

## What's here

| File | Contents |
|---|---|
| `RESEARCH.md` | The full written analysis — market map, competitor profiles, findings, recommendations |
| `data/competitors.json` | The same research as structured data: financials, feature matrix, findings, ranked recommendations |

## Scope

The market is defined as **masjids, Islamic centres and Islamic education charities serving
Sheldon, Solihull and east/south-east Birmingham**, plus one regional benchmark that competes
for the same donor pounds without competing for the same prayer footfall.

| Tier | Organisation | Why it's in scope |
|---|---|---|
| 1 | Jami Mosque & Islamic Centre (JMIC) | Same road, overlapping catchment, 50-year head start |
| 1 | Solihull Central Masjid & Community Centre | Nearest masjid inside Solihull proper |
| 1 | Solihull Islamic Education Academy (SIEA) | Competes for the same families' children |
| 1 | Deen Central | Overlapping Solihull catchment; financially distressed |
| 2 | Green Lane Masjid (GLMCC) | Benchmark — absorbs West Midlands discretionary giving |

## Sources

- Charity Commission for England and Wales — Register of Charities (financials, governance)
- Companies House
- Organisation websites, surfaced via the search index
- Donation platforms: MosquePay, The Masjid App, TotalGiving, CharityChoice

## Known gaps

These are limits of the research environment, not of the market:

1. **No live page crawls.** Outbound HTTPS to these domains was blocked by this environment's
   egress proxy (`403` on CONNECT). Page-level detail is reconstructed from the search index,
   so site structure is evidenced by known URLs rather than a full crawl.
2. **No quantitative SEO data.** The connected Ahrefs plan does not include Site Explorer
   (`Insufficient plan`) and the Semrush account has no API units remaining. There are no
   traffic, domain-rating or keyword-ranking figures here. Everything quantitative in this
   research is financial, from the Charity Commission.
3. **Solihull Central Masjid filed a nil return** for FYE 2024, so its published £0 income does
   not reflect actual activity.

Closing gaps 1 and 2 requires either an allow-listed egress domain or SEO API credits.

## Refreshing this research

Charity Commission figures update annually. Manarat's year end is **31 March**, so new figures
typically appear in the autumn. When refreshing:

1. Pull the current year's income/expenditure for each org from the Register of Charities.
2. Update `financials` and `comparative_table` in `data/competitors.json`.
3. Re-check the `feature_matrix` rows against each live site — most gaps in it are cheap for a
   competitor to close.
4. Re-rank `recommendations` against what's actually shipped since.

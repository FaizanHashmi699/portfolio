# Manarat Foundation — Competitor & Market Research

Competitive research project for **[manaratfoundation.org.uk](https://manaratfoundation.org.uk/)** (Manarat Foundation,
registered charity 1148223, 155 Coventry Road, Sheldon, Birmingham).

> **This directory is self-contained.** It does not touch `index.html`, `style.css` or anything
> else belonging to the portfolio coursework in the repository root.

## What's here

| File | Contents |
|---|---|
| `RESEARCH.md` | The full written analysis — trend, league table, competitor profiles, findings, recommendations, corrections |
| `data/competitors.json` | The same research as structured data: five-year financials, feature matrix, findings, ranked recommendations |
| `report.html` | The presentation version, published as an Artifact |

## Scope

The market is defined as **masjids, Islamic centres and Islamic education charities serving
Sheldon, Solihull and east/south-east Birmingham**, plus one regional benchmark that competes
for the same donor pounds without competing for the same prayer footfall.

| Tier | Organisation | Why it's in scope |
|---|---|---|
| 1 | **The Olton Project (TOP)** | **Overtook Manarat on income in the same financial year** |
| 1 | Jami Mosque & Islamic Centre (JMIC) | Same road, overlapping catchment, 50-year head start |
| 1 | Solihull Central Masjid & Community Centre | Nearest masjid inside Solihull proper |
| 1 | Solihull Islamic Education Academy (SIEA) | Competes for the same families' children |
| 1 | Deen Central, operating as The Hub | Overlapping Solihull catchment; financially distressed |
| 2 | Green Lane Masjid (GLMCC) | Benchmark — absorbs West Midlands discretionary giving |

## Revision history

**Revision 2 (current)** added five-year financial histories, two organisations missed the first
time, and Census demographics. It corrected four revision-1 conclusions — most importantly that
Manarat is **3rd of 6**, not 2nd of 5. See §9 of `RESEARCH.md` and `meta.corrections` in the JSON.

## Sources

- Charity Commission for England and Wales — Register of Charities, including financial-history pages
- Companies House
- ONS Census 2021 and Birmingham City Observatory (catchment demographics)
- Organisation websites, surfaced via the search index
- Donation platforms and directories: MosquePay, The Masjid App, JustGiving, TotalGiving, CharityChoice, PraySalat, NearestMosque

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
4. **Ward-level Muslim population for Sheldon** was not obtainable; borough-level Census figures
   are used instead.
5. **Deen Central / The Hub publishes no financials.** Charity 1154494 (Solihull Health & Education
   Partnership) shares its Hermitage Road address, but the link is unconfirmed.
6. **A second, older Olton Project registration** (1138839) exists alongside the CIO (1183781).
   The CIO appears to have succeeded it; unconfirmed.

Closing gaps 1 and 2 requires either an allow-listed egress domain or SEO API credits.

## Refreshing this research

Charity Commission figures update annually. Manarat's year end is **31 March**, so new figures
typically appear in the autumn. When refreshing:

1. Pull the current year's income/expenditure for each org from the Register of Charities.
2. Update `financials` and `comparative_table` in `data/competitors.json`.
3. Re-check the `feature_matrix` rows against each live site — most gaps in it are cheap for a
   competitor to close.
4. Re-rank `recommendations` against what's actually shipped since.

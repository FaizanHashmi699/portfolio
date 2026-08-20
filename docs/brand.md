# Brand Guidelines

**Status:** v1.0 · **Last reviewed:** August 2026

## The name

**Maqam** (مقام) — Arabic for a place, a standing, a station. It is also the name for the
melodic modes of Arabic music, which gives it warmth without being decorative.

It was chosen over the category's conventions deliberately. The market is full of names
built from _Emirates_, _Gulf_, _Global_, _Business Setup_ and _Consultants_ in various
permutations, all of which are descriptive, unownable, and indistinguishable from one
another in a search result. A short, real word is memorable, trademarkable, and does not
tell a customer we are the same as the other nine firms they have open in other tabs.

It is pronounced _ma-QAAM_. Two syllables, stress on the second.

**Never** write it in caps (MAQAM), never hyphenate it, never translate it in body copy.
The Arabic form مقام may be used in Arabic-language contexts.

Everything user-facing reads the name from `src/config/brand.ts`. Renaming the product is
one edit to that file — nothing else hard-codes it.

## The mark

An arch on a baseline: the shape shared by a doorway, a passport stamp, and Islamic
architecture. A threshold you are about to cross.

The outer arch is brand blue, the inner one gold. At small sizes the two strokes read as a
single letterform; at large sizes the inner arch reads as a person standing in the opening.

**Clear space:** at least the height of the inner arch on every side.
**Minimum size:** 24px tall on screen. Below that use the outer arch alone.
**Never:** rotate it, add a drop shadow, fill the counters, place it on a busy photograph,
or recolour it outside the palette below.

Files: `public/icon.svg` (standard), `public/icon-maskable.svg` (Android launcher, artwork
inside the safe zone), `src/app/apple-icon.tsx` (iOS, drawn on its own dark ground because
iOS composites onto white).

## Colour

Built in **OKLCH**, not hex or HSL. OKLCH is perceptually uniform: two colours with the
same lightness value look equally bright, so a single scale behaves predictably across
hues and contrast ratios stay stable when the hue shifts. That is what lets the palette
clear WCAG AA in both light and dark themes without hand-tuning every pair.

| Family    | Hue                           | Role                                                                                                    |
| --------- | ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Ink**   | 250 — deep institutional blue | The brand. Blue is what "legitimate" looks like in finance and government across every market we serve. |
| **Sand**  | 75 — warm desert gold         | The sole accent. Primary actions only.                                                                  |
| **Slate** | 250 at very low chroma        | Neutrals, tinted with the brand hue so greys feel related to the blue rather than muddy beside it.      |

**Gold appears on roughly 2% of any screen.** Scarcity is what makes an accent read as an
accent; a page with three gold elements has none.

### The one rule people break

Gold at its brand lightness reaches only **2.2:1 on white** — nowhere near the 4.5:1 body
text needs. So gold is a _fill_ colour, not a _text_ colour. For text there is a separate
`--accent-text` token (a darker step of the same hue) which reads as gold and clears AA.
Using `text-accent` for body copy is a bug, and axe catches it in CI.

Semantic colours (success, warning, danger) are pulled toward the brand's chroma level so
they belong to the same family rather than looking like browser defaults.

## Typography

- **Display / headings:** Sora — geometric, slightly technical, distinct from the humanist
  sans every competitor uses.
- **Body:** Inter — the most legible screen face available for long passages read in a
  second language.
- **Numbers:** always `tabular-nums`. Prices in a table that do not align vertically look
  careless, and this product's whole argument is that our numbers are trustworthy.

The type scale is fluid `clamp()`, so no breakpoint is ever needed for text size.

Under RTL, money and dates keep Western digits deliberately — a customer must be able to
match our figures against a government portal character for character.

## Voice

We are the consultancy that tells you the thing that costs us the sale.

**Write like this:**

- "Your passport has 3 months validity remaining — the UAE requires at least 6."
- "Nothing blocks this route, but strengthening the gaps below will materially improve your file."
- "We won't submit while a blocker is outstanding — submitting anyway would spend your government fee on an application we expect to be refused."

**Not like this:**

- "Invalid document." — tells the reader nothing they can act on.
- "Our expert team of professionals delivers world-class service." — true of everyone, therefore information about no one.
- "Guaranteed approval" / "100% success rate" — prohibited outright. See below.

**Rules:**

1. **Never promise an outcome.** No "guaranteed", "assured", "will be approved". This is a
   legal position, not a stylistic one, and there are tests asserting it in every language.
2. **Never imply government affiliation.** We are a private consultancy, and the footer
   says so on every page.
3. **Every error carries a fix.** If we tell someone something is wrong, we tell them what
   to do about it in the same breath.
4. **Name the number.** "From AED 12,900" is the category's habit and we do not have it.
5. **Second-language readers first.** Short sentences, concrete nouns, no idiom. Our
   customers are frequently reading in their third language on a phone.
6. **British English** throughout — the UAE convention. _Licence_ (noun), _organisation_,
   _attestation_.

## Photography and illustration

We use none of the category's stock vocabulary: no handshakes, no skyline at golden hour,
no smiling advisor pointing at a laptop. It is generic, it is expensive, and it signals
that the brand had nothing specific to say.

Instead the visual system is the 3D dune field on the hero — generated, not photographed,
on brand without being literal, and costing nothing to serve. Where imagery is needed
later, prefer real documents, real interfaces and real people over stock.

## Open Graph cards

Generated per page rather than designed by hand — with 14 services, 48 nationality pages
and 12 free zones, hand-made cards would be stale within a week.

Service cards carry **the price on the card**. Somebody sharing one into a WhatsApp group
is sharing the number, which is exactly the behaviour the positioning depends on.

See `src/lib/og.tsx`.

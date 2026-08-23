# Content review — for Linda

Everything on the site comes from the Bokadirekt listing, which is the source of
truth for names, prices and durations. Nothing here was invented. This page
lists the judgement calls that need a human decision.

## 1. Spelling corrections

The booking system contains a few slips. The website shows the corrected
spelling; **the booking system itself is unchanged**, so the name a customer
sees when they land on Bokadirekt still reads as it does today. Confirm each
one, and consider correcting it in Bokadirekt too so the two match.

| In Bokadirekt                                     | On the website                                      |
| ------------------------------------------------- | --------------------------------------------------- |
| Ansiksbehandling (category)                       | Ansiktsbehandlingar                                 |
| Ansiksmassage                                     | Ansiktsmassage                                      |
| Ansiktsbehandling Dr.Schammek Green Peel          | Ansiktsbehandling Dr. Schrammek Green Peel          |
| Co2 -laser uppstramning runt munnen               | CO2-laser uppstramning runt munnen                  |
| fransförlängning singel                           | Fransförlängning singel                             |
| färgning fransar & bryn                           | Färgning fransar & bryn                             |
| Head&face spa lyx                                 | Head & face spa lyx                                 |
| Överkroppsmassage (scalp,ansikte,axlar och armar) | Överkroppsmassage (skalp, ansikte, axlar och armar) |
| Fransförlängning återbesök 90min                  | Fransförlängning återbesök 90 min                   |
| Browlift & Lashlift ink färgning                  | Browlift & lashlift inkl. färgning                  |
| Lashlift&browlift ink färg (elev)                 | Lashlift & browlift inkl. färg (elev)               |

## 2. English translations

All 37 English entries are marked `needs-review`. They are faithful
translations of the Swedish text, but **treatment copy must be read by a human
before it is trusted**. Mistranslated treatment text is a safety and legal
issue, not a cosmetic one.

Set `translationStatus: human` on an entry once it has been checked. CI reports
how many are still outstanding.

## 3. Claims in the existing copy

Some of the current Bokadirekt descriptions contain efficacy language —
"hudföryngrande", "medicinsk utvecklad", "reducera fina linjer och rynkor",
"bleker 2–9 nyanser". These are reproduced from the salon's own text and have
**not** been amplified. They are worth reviewing: Swedish marketing law
restricts health and efficacy claims, and the exposure sits with the business,
not with the booking platform.

Nothing needs to change for the site to launch. It is flagged so the decision is
a conscious one.

## 4. Campaign end dates

The three KAMPANJ offers have no end date in Bokadirekt, so the site treats them
as running until removed. If any of them should stop on a given date, set
`Gäller till` in the CMS and the offer disappears by itself — a nightly rebuild
handles expiry without anyone deploying.

## 5. Photographs

The images currently on the site are cropped from the studio's own social-media
posts and are placeholders for the demo. Before launch:

- Confirm the studio holds the rights to publish them (who took them?)
- Confirm no identifiable client appears without consent
- Record the outcome in `brand/CONSENT.md`
- Ideally replace them with full-resolution originals

## 6. Missing from the site

Deliberately absent because the facts were not available:

- Any description of the studio's history or Linda's qualifications beyond the
  Kroppsterapeuternas membership
- Wilma's and Linda's biographies
- The full Green Peel variant list (only "Fresh Up" is described in Bokadirekt;
  the text implies there are others)
- Opening hours for weekends — Bokadirekt lists Saturday and Sunday as closed,
  though it also mentions variable weekend availability

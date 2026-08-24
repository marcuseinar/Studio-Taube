# Content review — for Linda

Everything on the site comes from the Bokadirekt listing, which is the source of
truth for names, prices and durations. Nothing here was invented. This page
lists the judgement calls that need a human decision.

## 1. Spelling corrections

The booking system contains a few slips. The website shows the corrected
spelling; **the booking system itself is unchanged**, so the name a customer
sees when they land on Bokadirekt still reads as it does today. Confirm each
one, and consider correcting it in Bokadirekt too so the two match.

| In Bokadirekt                                      | On the website                                      |
| -------------------------------------------------- | --------------------------------------------------- |
| Ansiksbehandling (category)                        | Ansiktsbehandlingar                                 |
| Ansiksmassage                                      | Ansiktsmassage                                      |
| Ansiktsbehandling Dr.Schammek Green Peel           | Ansiktsbehandling Dr. Schrammek Green Peel          |
| Co2 -laser uppstramning runt munnen                | CO2-laser uppstramning runt munnen                  |
| fransförlängning singel                            | Fransförlängning singel                             |
| färgning fransar & bryn                            | Färgning fransar & bryn                             |
| Head&face spa lyx                                  | Head & face spa lyx                                 |
| Överkroppsmassage (scalp,ansikte,axlar och armar)  | Överkroppsmassage (skalp, ansikte, axlar och armar) |
| Fransförlängning återbesök 90min                   | Fransförlängning återbesök 90 min                   |
| Browlift & Lashlift ink färgning                   | Browlift & lashlift inkl. färgning                  |
| Lashlift&browlift ink färg (elev)                  | Lashlift & browlift inkl. färg (elev)               |
| skräddarsyr (Ansiktsbehandling classic)            | skräddarsys                                         |
| Dr.Scrammek (once, mid-text in Green Peel)         | Dr. Schrammek                                       |
| ärböjda / en liten spole (Lashlift inkl. färgning) | är böjda / En liten spole                           |
| hårstån (Head spa)                                 | hårstrån                                            |

### One phrase left untouched — please check

Head spa's own text reads "…jämnar ut hårstrån och inskar brått" — "inskar
brått" does not parse as standard Swedish and the site has not guessed at what
it should say. It is shown exactly as Bokadirekt has it. If you know the
intended phrase (perhaps "minskar burrighet"?), update it in the CMS.

## 2. English translations

All 37 English entries are marked `needs-review`. They are faithful
translations of the Swedish text, but **treatment copy must be read by a human
before it is trusted**. Mistranslated treatment text is a safety and legal
issue, not a cosmetic one.

Set `translationStatus: human` on an entry once it has been checked. CI reports
how many are still outstanding.

One entry needed a deliberate translation choice rather than a literal one: the
Green Peel description makes several claims as flat statements ("ger en
uppstramande effekt", "verkar kraftigt antibakteriellt"). The English
translation renders these as "is said to" rather than as fact, which is a more
cautious reading than the Swedish original, not a different one. The Swedish
text is untouched and reproduced verbatim — see §3 below.

## 3. Claims in the existing copy

Some of the current Bokadirekt descriptions contain efficacy language —
"hudföryngrande", "medicinsk utvecklad", "reducera fina linjer och rynkor",
"bleker 2–9 nyanser". These are reproduced from the salon's own text and have
**not** been amplified. They are worth reviewing: Swedish marketing law
restricts health and efficacy claims, and the exposure sits with the business,
not with the booking platform.

Nothing needs to change for the site to launch. It is flagged so the decision is
a conscious one.

## 4. Campaign end dates and visibility

The three KAMPANJ offers have no end date set in Bokadirekt. The site now
watches the Bokadirekt catalogue itself rather than trusting a date: an offer
disappears from the site automatically the moment it is removed from
Bokadirekt, at whatever price Bokadirekt currently shows for it — see
`docs/DECISIONS.md` D11. Setting `Gäller till` in the CMS can still end an
offer earlier than that if you want a fixed promotional window.

Each campaign now also has its own page (linked as "Läs mer" from its card),
the same way every treatment does, so the full offer text — including
aftercare and contraindication notes — is actually visible on the site rather
than sitting unused in the content file.

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
- Opening hours for weekends — Bokadirekt lists Saturday and Sunday as closed,
  though it also mentions variable weekend availability

## 7. Treatments Bokadirekt has no description for

Bokadirekt itself has no description text for these seven — not a gap in what
was copied, there is genuinely nothing there to copy. The site currently shows
a one-line restatement of the treatment's own name so the page is not blank,
and nothing more:

- Ansiktsbehandling tonår
- Browlift & lashlift inkl. färgning
- Browlift inkl. färg & form
- Lashlift inkl. brynformning & brynfärg
- Borttagning av fransar
- Formning av bryn inkl. färg
- Färgning fransar & bryn

If you write a proper description for any of these in Bokadirekt, the next
content edit can bring it over — the site does not invent detail Bokadirekt
doesn't have.

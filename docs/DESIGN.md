# Design system

Light, warm and pastel. The visitor is someone treating themselves — the page
should feel calm and cared-for, not clinical. The existing black-dominant
material is deliberately not carried over; the sand tone from it is.

---

## 1. Colour tokens

Defined once in `src/styles/tokens.css` as CSS custom properties, and mapped
into the Tailwind theme. **Components never contain a colour literal.** Changing
the palette must be possible by editing that one file.

| Token               | Hex       | Use                                         |
| ------------------- | --------- | ------------------------------------------- |
| `--color-cream`     | `#FAF7F3` | Page background                             |
| `--color-shell`     | `#F3EDE6` | Alternating sections, cards                 |
| `--color-blush`     | `#EFD9D1` | Soft emphasis fills, hero wash              |
| `--color-sage`      | `#C8D0C4` | Secondary accent, the "hälsa" side          |
| `--color-sand`      | `#C2A88E` | **Decorative only** — rules, borders, fills |
| `--color-sand-deep` | `#A78568` | Large text ≥24px, UI borders, icons         |
| `--color-sand-ink`  | `#8C6A4E` | Accent text, primary button background      |
| `--color-ink`       | `#2B2622` | Body and heading text                       |
| `--color-ink-muted` | `#6B615A` | Secondary text, captions                    |

`--color-sand` was sampled from the leaf motif in the studio's own material, so
the palette stays recognisable to their existing audience.

### Verified contrast

Measured, not assumed. WCAG 2.2 AA requires 4.5:1 for body text, 3:1 for large
text and UI boundaries.

| Pair                       | Ratio    | Verdict                        |
| -------------------------- | -------- | ------------------------------ |
| ink on cream               | 14.01    | AAA                            |
| ink on shell               | 12.88    | AAA                            |
| ink on blush               | 11.06    | AAA                            |
| ink on sage                | 9.46     | AAA                            |
| ink-muted on cream         | 5.65     | AA                             |
| sand-ink on cream          | 4.59     | AA                             |
| cream on sand-ink (button) | 4.59     | AA                             |
| sand-deep on cream         | 3.17     | large text and UI only         |
| **sand on cream**          | **2.12** | **fails — never use for text** |

The last row is the trap. `--color-sand` is beautiful and unreadable. It is a
decorative token, and CI's axe run will catch it if it is misused, but do not
rely on that — use `--color-sand-ink` for anything a person has to read.

Pastel backgrounds do not exempt text from contrast. Never place
`--color-sand-deep` text on `--color-blush`.

---

## 2. Typography

Self-hosted through Fontsource with `font-display: swap`. No Google Fonts CDN —
see `docs/DECISIONS.md` D7.

| Role                 | Treatment                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Logo / wordmark      | The vectorised SVG logo. Not a webfont.                                                                       |
| Display headings     | Wide letter-spacing echoing `S K Ö N H E T  &  H Ä L S A` — `letter-spacing: 0.28em`, uppercase, light weight |
| Section headings     | A warm serif, moderate weight, generous line-height                                                           |
| Body                 | Clean humanist sans, 17–18px base, `line-height: 1.7`                                                         |
| Prices and durations | Tabular numerals, so price lists align                                                                        |

Rules:

- Never letter-space lowercase body text. The wide tracking belongs to short
  uppercase labels only.
- Never set body text below 16px.
- Never centre a paragraph longer than two lines.
- Line length: 60–75 characters. Enforce with a `max-width`, not by hand.

The script in the logo is decorative and must never be used for text a screen
reader or a person needs to read.

---

## 3. Spacing and layout

An 8px base scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`. No value
outside the scale without a reason in the PR.

- Generous whitespace is the primary luxury signal. When a section feels
  cramped, remove content before reducing spacing.
- Content column max-width ~1200px; text column ~68ch.
- Mobile-first. Most visitors arrive from Instagram on a phone — the phone
  layout is the design, the desktop layout is the adaptation.
- Sections alternate `--color-cream` and `--color-shell` for rhythm. Do not
  introduce a third alternating background.

---

## 4. Imagery

- Real photographs of the studio and the work, never stock. The existing
  material has a soft, bright, natural-light quality — match it.
- Warm white balance. Cool or blue-shifted images clash with the palette; the
  studio's own white balance skews slightly cool, so correct toward warm.
- Every image goes through Astro's image pipeline: AVIF/WebP, responsive
  `srcset`, explicit `width`/`height` to prevent layout shift.
- Every image needs meaningful Swedish and English alt text. Decorative images
  get `alt=""` and nothing else.
- No photograph of an identifiable client without consent recorded in
  `brand/CONSENT.md`.

---

## 5. Components

Build these, in this order, each replaceable in isolation:

`Header` · `Nav` · `LanguageSwitch` · `Hero` · `TreatmentCard` ·
`TreatmentCategory` · `PriceList` · `CampaignBanner` · `BookingButton` ·
`StaffCard` · `TestimonialQuote` · `OpeningHours` · `LocationMap` · `Footer` ·
`SeoHead`

Constraints:

- Presentational components take props and render. They never read content
  collections and never know Bokadirekt exists.
- `BookingButton` is the only component that touches `src/lib/booking/`.
- Every interactive element has a visible focus ring using `--color-sand-ink`,
  never `outline: none`.
- Minimum touch target 44×44px.
- Respect `prefers-reduced-motion`. Animation is a garnish; nothing may depend
  on it to be usable.

---

## 6. Logo

Source screenshots live in `brand/source/`. The dark-background version has the
highest contrast and is the best tracing source.

Plan: trace with potrace, hand-clean the paths, and ship a single SVG using
`currentColor` so one file serves both light and dark contexts. Provide an
accessible name (`Studio Taube — Skönhet & Hälsa`), not an empty `alt`.

**Caveat to raise with Linda:** a trace of a screenshot gets very close but is
not identical to the original vector. If she can obtain the designer's source
file, that beats any trace and should replace it.

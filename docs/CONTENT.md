# Content model

All user-visible text lives here, never in components. Schemas are declared in
`src/content.config.ts` with Zod; invalid content fails the build.

Two hard constraints shape every schema:

1. **Sveltia CMS must be able to render it.** Keep schemas flat, avoid
   discriminated unions and computed types. If a schema change breaks `/admin`,
   fix the CMS config in the same commit.
2. **Every entry exists in both `sv` and `en`.** A missing translation fails the
   build. There is no silent fallback.

Layout: `src/content/<collection>/<locale>/<slug>.md`

---

## `services` — treatments

```ts
{
  title: string
  category: 'ansiktsbehandling' | 'laser' | 'fransar-bryn' | 'massage'
          | 'head-spa' | 'tandblekning' | 'konsultation'
  durationMinutes: number
  priceSek: number            // integer, SEK, never a formatted string
  priceFrom: boolean          // true renders as "från 1 450 kr"
  bokadirektServiceId?: string // enables a per-treatment deep link
  order: number
  featured: boolean
  image?: image
  description: markdown
}
```

Formatting is presentation: store `1450` and `priceFrom: true`, and let the
`PriceList` component render `från 1 450 kr` in the right locale. Storing the
formatted string breaks English, breaks sorting, and rots.

`durationMinutes` and `priceSek` come from Linda or the Bokadirekt listing.
Never estimate them, and never carry a stale value forward — prices change.

Known categories as of the last check of the Bokadirekt listing: konsultation
(free), ansiktsbehandlingar, CO2-laser, fransar och bryn, massage, head spa,
tandblekning. **Confirm the current list with Linda before publishing** — the
2023 flyer in `brand/source/` is outdated and lists treatments the studio no
longer appears to offer.

---

## `campaigns` — offers and seasonal content

```ts
{
  title: string
  validFrom: date
  validTo: date
  summary: string
  image?: image
  ctaLabel: string
  ctaServiceSlug?: string   // links the CTA to a service's booking URL
  priority: number
  body: markdown
}
```

Campaigns are filtered by date at build time. An expired campaign must not
render — and because the site is statically built, a nightly scheduled rebuild
keeps expiry honest without anyone remembering to deploy.

`ctaServiceSlug` resolves through `BookingProvider`. A campaign never contains a
raw URL.

---

## `pages` — long-form copy

Om oss, integritetspolicy, villkor, kontakt. Frontmatter carries `title`,
`description`, `updated`; the body is Markdown.

---

## `staff`

```ts
{
  name: string
  role: string
  image?: image
  bokadirektStaffId?: string
  order: number
  bio: markdown
}
```

Currently Linda (owner) and Wilma. Do not publish personal details beyond what
Linda approves.

---

## UI strings

Not a content collection. `src/i18n/sv.ts` is the source of truth for keys;
`en.ts` is typed against it, so a missing key is a **compile error**, not a
runtime fallback.

Keys are semantic, not literal: `booking.cta.primary`, never `booking.bokaTid`.

---

## Writing guidance

- Warm, direct, unhurried. Address the reader as `du`.
- Describe what a treatment **is** and what it **involves**. Never claim it
  cures, heals, removes, rejuvenates, or is clinically proven — see CLAUDE.md §2.
- No superlatives the studio cannot substantiate. "Marknadens bästa" is a
  marketing-law problem, not a style problem.
- Swedish is written first and is the source text. English is a translation of
  it, and treatment copy must be reviewed by a human before it ships.

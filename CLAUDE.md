# CLAUDE.md — Working agreement for AI contributors

This file is the operating manual for any AI agent working in this repository.
Read it in full before your first edit of a session. It takes precedence over
general habits and defaults.

Companion documents, read them when the task touches their area:

| Document               | Read it when                                                |
| ---------------------- | ----------------------------------------------------------- |
| `docs/ARCHITECTURE.md` | Adding pages, routes, integrations, build tooling           |
| `docs/DESIGN.md`       | Touching anything visual: colour, type, spacing, components |
| `docs/CONTENT.md`      | Adding or changing content collections, copy, translations  |
| `docs/DECISIONS.md`    | You are about to contradict a locked decision               |

---

## 1. What this is

A marketing and booking-entry website for **Studio Taube — Skönhet & Hälsa**, a
beauty and skin-care studio at Nääs Fabriker.

| Fact              | Value                                                |
| ----------------- | ---------------------------------------------------- |
| Address           | Spinnerivägen 1, 448 50 Tollered (Nääs Fabriker)     |
| Domain            | `studiotaube.se` (owned, currently parked at Loopia) |
| Hosting           | GitHub Pages, static only                            |
| Booking           | Bokadirekt, salon id `studio-taube-56559`            |
| Staff             | Linda (owner), Wilma                                 |
| Languages         | Swedish (primary), English                           |
| Existing presence | Instagram `@linda_studiotaube`, Facebook, Bokadirekt |

The site does **not** take payments and does **not** store customer data. It
informs, builds trust, and hands the visitor to Bokadirekt to book.

---

## 2. Non-negotiables

Violating any of these is a defect, regardless of how good the rest of the
change is. CI enforces most of them; the rest are on you.

1. **Never invent facts about treatments, prices, durations, or results.**
   Every price, duration and treatment description originates from Linda or the
   Bokadirekt listing. If you need a value you do not have, stop and ask. Do not
   estimate, do not carry over a value from an older file, do not fill a
   placeholder with something plausible.
2. **Never write medical or clinical claims.** This studio performs CO2-laser,
   peels and skin treatments. Swedish marketing law restricts health and
   efficacy claims, and unsupported ones create real legal exposure for Linda.
   Describe what a treatment _is_ and what it _involves_. Do not write that it
   cures, heals, removes, rejuvenates, or is medically proven. Flag any copy you
   are unsure about instead of shipping it.
3. **No content in markup.** Every user-visible string lives in a content
   collection or translation file. A hard-coded Swedish sentence in a component
   is a defect.
4. **No raw colour, font or spacing values in components.** Use design tokens.
   See `docs/DESIGN.md`.
5. **No direct Bokadirekt URLs outside `src/lib/booking/`.** All booking entry
   points go through the `BookingProvider` abstraction.
6. **No third-party script without an explicit decision.** No Google Fonts CDN,
   no Google Analytics, no tracking pixels, no chat widgets. Fonts are
   self-hosted; analytics is cookieless.
7. **No secrets in the repo**, and no personal data of clients — including
   photographs of identifiable clients — without written consent recorded in
   `brand/CONSENT.md`.
8. **Never break the static build.** No server-side runtime, no API routes, no
   SSR adapter. GitHub Pages serves files and nothing else.
9. **Accessibility is a gate, not an aspiration.** WCAG 2.2 AA. A change that
   fails axe does not ship.
10. **Do not modify `docs/DECISIONS.md` to justify a change.** If a locked
    decision is wrong, say so and propose reversing it explicitly.

---

## 3. Stack

| Layer        | Choice                                                | Why                                                                                              |
| ------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Framework    | Astro 5                                               | Static output, zero JS by default, typed content collections, islands when we need interactivity |
| Language     | TypeScript, `strict`                                  | Content schemas and booking logic are worth type-checking                                        |
| Styling      | Tailwind CSS v4, theme bound to CSS custom properties | Palette swap = one file                                                                          |
| Content      | Astro Content Collections + Zod                       | Invalid content fails the build, not production                                                  |
| CMS          | Sveltia CMS at `/admin`, GitHub backend               | Free, git-based, no database                                                                     |
| Auth for CMS | Cloudflare Worker (OAuth relay)                       | Free tier, only moving part outside GitHub                                                       |
| Tests        | Vitest (units), Playwright (journeys + axe)           |                                                                                                  |
| CI/CD        | GitHub Actions → GitHub Pages                         |                                                                                                  |
| Analytics    | Cloudflare Web Analytics                              | Cookieless, so no consent banner is required                                                     |

Do not add a dependency without justifying it in the PR description. Prefer the
platform over a package; prefer a 20-line utility over a 200 kB library.

---

## 4. Repository map

```
brand/source/          Original social-media screenshots. Read-only reference.
brand/                 Derived brand assets (vectorised logo, consent records).
docs/                  Architecture, design, content and decision records.
public/                Files served verbatim. Favicons, robots.txt, CNAME.
src/components/        Presentational Astro components. No data fetching.
src/layouts/           Page shells.
src/pages/             Routes. Swedish at /, English at /en/.
src/content/           Content collections (services, campaigns, pages, staff).
src/i18n/              UI strings per locale, and locale helpers.
src/lib/booking/       BookingProvider abstraction. The ONLY place that knows
                       Bokadirekt exists.
src/styles/tokens.css  The single source of truth for colour, type and spacing.
tests/e2e/             Playwright specs.
```

---

## 5. Commands

```bash
npm run dev          # local dev server
npm run build        # production build, must succeed before any commit
npm run check        # astro check + tsc, strict
npm run lint         # eslint + stylelint + prettier --check
npm run test         # vitest
npm run test:e2e     # playwright, includes axe accessibility assertions
npm run verify       # everything CI runs. Run this before you push.
```

`npm run verify` is the contract. If it passes locally and fails in CI, that
mismatch is itself a bug worth fixing.

---

## 6. Code standards

We follow Clean Code (Robert C. Martin), adapted to component-based frontend
work. The principles below are the operative ones; where the book's advice and
readability conflict, readability wins, but you must be able to explain why.

### Naming

- Names reveal intent. `treatmentDurationMinutes`, not `dur`, not `x`.
- No abbreviations except universally understood ones (`id`, `url`, `html`).
- Booleans read as assertions: `isBookable`, `hasCampaign`, not `campaign` or `flag`.
- Swedish domain nouns keep their Swedish name where the domain is Swedish
  (`behandling`, `prisFrån`) **only** in content schemas. Code identifiers are
  English. Do not mix the two inside one identifier.

### Functions

- One reason to exist. If you need "and" to describe it, split it.
- No flag arguments. `renderCard(service, true)` is forbidden; write two
  functions or pass a named option object.
- No more than three parameters. Beyond that, take an object.
- No side effects hidden behind a query-sounding name.
- Prefer pure functions in `src/lib/`. They are the parts we unit-test.

### Components

- A component does one of two things, never both:
  - **Presentational** — receives props, renders markup. No data access.
  - **Container** — reads content collections, composes presentational children.
- Props are a typed interface with a name, not an inline anonymous type.
- No business logic in templates. If a template contains a conditional chain or
  a computation, lift it into a named function or a prop.
- A component longer than ~120 lines is a smell. Look for the component hiding
  inside it.

### Duplication

- Two occurrences: note it. Three: extract it.
- Do not abstract prematurely. A shared component built from one use case is
  usually the wrong shape.

### Comments

- Comments explain **why**, never **what**. If a comment explains what the code
  does, rename things until it is unnecessary and delete the comment.
- No commented-out code. Git remembers.
- No changelog comments, no author tags, no decorative banners.
- Legitimate comments: a legal or regulatory constraint, a non-obvious
  browser/Bokadirekt workaround with a link, a deliberate deviation from a rule
  here.

### Error handling

- Content errors fail the build. Do not swallow a Zod error to keep the build
  green.
- Runtime code that touches a third party (the booking embed) degrades
  gracefully: if the widget fails to load, the user still gets a working link.

### Boy Scout rule

Leave code cleaner than you found it — but keep unrelated cleanups in a
separate commit so a reviewer can see the actual change.

---

## 7. Content rules

- Every content type has a Zod schema in `src/content.config.ts`. Add the schema
  before the content.
- Schemas must stay **Sveltia CMS compatible**: flat where possible, no
  discriminated unions, no fields the CMS cannot render. If a schema change
  would break `/admin`, update the CMS config in the same commit.
- Prices are stored as integers in SEK, with an explicit `priceFrom: boolean`.
  Never store `"från 1 450 kr"` as a string — formatting is presentation.
- Every content entry exists in both `sv` and `en`, or the build fails.
  A missing translation is not allowed to silently fall back.
- Campaigns have a `validFrom`/`validTo` and are filtered at build time.
  An expired campaign must not render.

See `docs/CONTENT.md` for the collection shapes.

---

## 8. Booking rules

`src/lib/booking/` exposes one interface and the site uses only that:

```ts
interface BookingProvider {
  bookingUrlFor(service: Service): string;
  supportsInlineBooking(): boolean;
}
```

- Current implementation: `BookingLinkProvider` — deep links to Bokadirekt,
  per-service where a `bokadirektServiceId` exists, salon front page otherwise.
- Next: `BookingEmbedProvider` — Bokadirekt's embed widget in a lazy-loaded
  modal. Blocked on Linda supplying the snippet from her business account.
- Later, only if justified: `BookingApiProvider` — Bokadirekt API & Webhooks
  module, 399 kr/mån. Do not build toward this without an explicit decision.

Every "Boka tid" affordance in the UI must resolve through the provider. Adding
a provider must not require touching a single page or component.

---

## 9. Internationalisation

- Swedish is the default locale and lives at `/`. English lives at `/en/`.
- UI strings live in `src/i18n/{sv,en}.ts` and are accessed through a typed
  `t()` helper. A missing key is a type error, not a runtime fallback.
- Content entries are per-locale files, not a language field inside one file.
- Every page emits `hreflang` alternates and a canonical URL.
- Never machine-translate treatment descriptions without marking them for human
  review — mistranslated treatment copy is a safety and legal issue, not a
  cosmetic one.

---

## 10. Quality budgets

CI fails the build if any of these regress:

| Metric                         | Budget              |
| ------------------------------ | ------------------- |
| Lighthouse performance         | ≥ 95                |
| Lighthouse accessibility       | 100                 |
| Lighthouse SEO                 | ≥ 95                |
| axe violations                 | 0                   |
| Largest Contentful Paint       | ≤ 2.0 s (throttled) |
| Cumulative Layout Shift        | ≤ 0.05              |
| JS shipped to the landing page | ≤ 25 kB gzipped     |
| Any single image               | ≤ 250 kB served     |

Images are processed through Astro's image pipeline. Never commit an unoptimised
photograph straight from a phone into `public/`.

---

## 11. Testing expectations

- **Unit-test** everything in `src/lib/`: booking URL construction, price
  formatting, campaign date filtering, locale resolution. These are pure and
  cheap to test; there is no excuse for leaving them uncovered.
- **E2E-test** the journeys that make the site worth having:
  1. Visitor lands, finds a treatment, reaches the correct Bokadirekt page.
  2. Visitor reads opening hours and address, and the map link works.
  3. An active campaign appears; an expired one does not.
  4. Language switch preserves the current page.
  5. Every page passes axe.
- Do not write tests that assert implementation details of a component's markup.
  Test what a visitor can observe.
- A bug fix ships with a regression test that fails without the fix.

---

## 12. Git and PR conventions

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- One logical change per commit. Formatting churn goes in its own commit.
- Branch from `main`. Never commit directly to `main`.
- PR description states: what changed, why, what you verified, and any new
  dependency with justification.
- Never push a change whose `npm run verify` you have not seen pass.

---

## 13. Stop and ask the human

Do not guess on any of these. Ask, and wait.

- A price, duration, treatment name, or anything about what a treatment does.
- Whether a photograph may be published, and whether anyone in it consented.
- Anything that implies a health, medical or efficacy claim.
- Adding a paid service, or anything that changes running cost.
- Opening hours, staff details, contact details.
- Reversing a decision in `docs/DECISIONS.md`.

An empty section is better than an invented one. If you need a fact you do not
have, ship the structure, leave the content absent, and say what you need.

---

## 14. Definition of done

A change is done when all of the following are true:

- [ ] `npm run verify` passes locally
- [ ] No hard-coded content, colour, or booking URL introduced
- [ ] Both `sv` and `en` are present for any new content
- [ ] New logic in `src/lib/` has unit tests
- [ ] New user-facing behaviour has an E2E assertion
- [ ] Accessibility checked with a keyboard, not only with axe
- [ ] No new dependency, or one justified in the PR
- [ ] Facts came from Linda or Bokadirekt, not from you

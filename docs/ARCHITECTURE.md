# Architecture

## Build and delivery

```
Markdown + tokens ──► Astro build ──► static HTML/CSS/JS ──► GitHub Pages
                          ▲                                      ▲
              Sveltia CMS ┘ (commits to main)      studiotaube.se ┘ (Loopia DNS)
```

No server and no database. Pages are rendered at build time; Svelte islands
hydrate in the browser only on the routes that use them.

## Islands

| Island                   | Route            | Cost                            |
| ------------------------ | ---------------- | ------------------------------- |
| `TreatmentFilter.svelte` | `/behandlingar/` | ~16.5 kB gzipped, `client:idle` |

The home page ships no JavaScript at all. An island enhances server-rendered
markup and never replaces it — see CLAUDE.md §3a.

---

## Routing

| Route                   | Content                      |
| ----------------------- | ---------------------------- |
| `/`                     | Swedish home                 |
| `/behandlingar/`        | Treatment overview           |
| `/behandlingar/<slug>/` | Single treatment             |
| `/priser/`              | Full price list              |
| `/kampanjer/`           | Active campaigns             |
| `/om-oss/`              | About, staff                 |
| `/kontakt/`             | Address, hours, map, contact |
| `/integritetspolicy/`   | GDPR                         |
| `/en/...`               | English equivalents          |
| `/admin/`               | Sveltia CMS                  |

Every page emits a canonical URL and `hreflang` alternates for both locales.

---

## Booking layer

`src/lib/booking/` is the only module that knows Bokadirekt exists.

```ts
interface BookingProvider {
  bookingUrlFor(service: Service): string;
  supportsInlineBooking(): boolean;
}
```

- `BookingLinkProvider` (v1) — per-treatment deep link when
  `bokadirektServiceId` is set, salon front page otherwise.
- `BookingEmbedProvider` — Bokadirekt's embed widget, lazy-loaded into a modal.
  Free per Bokadirekt's terms; blocked on Linda supplying the snippet.
  Must degrade to a plain link if the script fails to load.
- `BookingApiProvider` — requires the 399 kr/mån API module. Not on the roadmap
  without an explicit decision.

The provider is selected in one config value. Adding one must not require
touching any page or component.

---

## SEO and local discovery

- `BeautySalon` JSON-LD on every page: address, opening hours, geo, price
  range, `sameAs` linking Instagram, Facebook and Bokadirekt. Validated in CI.
- Sitemap and `robots.txt` generated at build.
- Per-page OG images.
- The site should reinforce, not replace, the Google Business Profile — the
  address and hours in JSON-LD must match it exactly, or local ranking suffers.

---

## Where the site is published

One constant decides it: `DEPLOY_TARGET` in `src/lib/site.ts`.

| Target                   | Serves at                             | Base             |
| ------------------------ | ------------------------------------- | ---------------- |
| `github-pages` (current) | `marcuseinar.github.io/Studio-Taube/` | `/Studio-Taube/` |
| `custom-domain`          | `studiotaube.se`                      | `/`              |

`studiotaube.se` is registered at Loopia and still parked, and the DNS move
waits on Linda deciding to use the site. Until then the project path is the
live URL, so nothing depends on a domain that has not moved.

Because the site is served from a subdirectory, **no internal link may be
hand-written as a site-root path**. Everything goes through `localisePath()`
for routes and `assetUrl()` for files in `public/`; Markdown links written as
`/behandlingar/...` are prefixed at build time by a rehype plugin in
`astro.config.mjs`. A link that skips these works locally at `/` and 404s in
production — `npm run check:links` catches it.

### Switching to the custom domain

1. Point DNS at GitHub: apex `A` records to `185.199.108–111.153`, apex `AAAA`
   to `2606:50c0:8000–8003::153`, `www` `CNAME` to `marcuseinar.github.io`.
   Remove Loopia's parking records first.
2. Set `DEPLOY_TARGET = 'custom-domain'`. The build then emits `dist/CNAME`
   and drops the base.
3. Update `BASE` in `tests/e2e/site-paths.ts` to `''`.
4. Update the sitemap URL in `public/robots.txt` and `site_domain` in
   `public/admin/config.yml`.
5. Tick Enforce HTTPS once GitHub has issued the certificate.

Do not move DNS without Linda's go-ahead — the parked page is what people find
today, and a botched cutover takes the domain down.

---

## CI/CD

Pull requests run: install → `lint` → `check` → `test` → `build` →
`test:e2e` (Playwright + axe) → Lighthouse CI against budgets → link check →
HTML validation → JSON-LD validation. Every one is a gate.

`main` runs the same suite and deploys to Pages only if green.

A nightly scheduled rebuild exists so campaign expiry takes effect without a
human deploying.

Dependabot for npm and Actions, grouped weekly.

---

## Cost model

| Item                              | Cost                     |
| --------------------------------- | ------------------------ |
| GitHub Pages, public repo         | 0 kr                     |
| Domain (already owned)            | ~119–200 kr/år, existing |
| Cloudflare Worker (CMS auth)      | 0 kr, free tier          |
| Cloudflare Web Analytics          | 0 kr                     |
| Bokadirekt embed                  | 0 kr, included           |
| _Optional:_ Bokadirekt API module | 399 kr/mån               |
| _Optional:_ contact form service  | 0 kr on free tier        |

Anything that adds recurring cost requires Linda's explicit approval.

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

## Domain and DNS

`studiotaube.se` is registered at Loopia and currently parked. Cutover:

1. Apex `A` records → GitHub Pages IPs, plus `AAAA` records.
2. `www` `CNAME` → the GitHub Pages host.
3. `public/CNAME` committed with the apex domain.
4. Enforce HTTPS in repository settings once the certificate is issued.

Do not change DNS without Linda's go-ahead — the parked page is currently what
people find, and a botched cutover takes the domain down.

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

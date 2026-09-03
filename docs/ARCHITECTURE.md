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
| `/erbjudanden/`         | Active campaigns             |
| `/erbjudanden/<slug>/`  | Single campaign              |
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

### Keeping up with Bokadirekt

```
03:00  Sync Bokadirekt catalogue  fetch -> validate -> data/bokadirekt-catalogue.json -> verify -> commit
03:17  Deploy                     builds main, so that night's snapshot goes live
```

An offer withdrawn from Bokadirekt stops rendering on the next deploy, because
campaign visibility is derived from the snapshot (docs/DECISIONS.md D11). The
two jobs are separate and ordered rather than chained: a push made with
`GITHUB_TOKEN` deliberately triggers no further workflow, so the Deploy cron is
what picks the snapshot up.

The sync never writes a catalogue that fails validation, so a Bokadirekt outage
leaves the previous snapshot — and therefore the site — untouched.

#### Where the catalogue comes from

`BOKADIREKT_SOURCE` selects the source. Both produce the same shape and pass
the same validation, so switching is configuration, not code (D12).

| Value            | Source                                         |
| ---------------- | ---------------------------------------------- |
| `page` (default) | The public salon page. Free, no credentials.   |
| `api`            | The Bokadirekt API module.                     |
| `api+page`       | The API, falling back to the page if it fails. |

Bokadirekt publishes no public API reference — it arrives with the paid module
— so nothing is assumed about it. These are set as repository **variables**,
except the two marked secret:

| Setting                    | Meaning                                          |
| -------------------------- | ------------------------------------------------ |
| `BOKADIREKT_API_URL`       | _(secret)_ endpoint listing the salon's services |
| `BOKADIREKT_API_KEY`       | _(secret)_ credential                            |
| `BOKADIREKT_API_AUTH`      | `bearer` (default), `header` or `query`          |
| `BOKADIREKT_API_AUTH_NAME` | header or query parameter name when not bearer   |
| `BOKADIREKT_API_DURATION`  | `seconds` (default) or `minutes`                 |

`BOKADIREKT_API_DURATION` is configuration rather than a guess because reading
minutes as seconds is a silent sixtyfold error: every plausibility check passes
and the site advertises a 90-second facial.

When credentials arrive, confirm the response shape against the real reference.
`toCategories()` in `scripts/lib/catalogue-sources/bokadirekt-api.mjs` handles
the shapes worth anticipating and throws naming the keys it actually received,
so adjusting it is a small, obvious edit rather than an investigation.

#### Refreshing on a webhook

The sync also runs on a `repository_dispatch` event of type
`bokadirekt-changed`, so a change at the salon can reach the site in minutes
rather than waiting for 03:00. Bokadirekt's webhook cannot call GitHub directly
— the dispatch endpoint needs a token that must not sit in a webhook
configuration — so it posts to the Cloudflare Worker that already relays CMS
auth, which holds the token and forwards:

```
POST /repos/marcuseinar/Studio-Taube/dispatches
{ "event_type": "bokadirekt-changed" }
```

This is optional. Without it the nightly cron still covers everything.

#### Running unattended

Once handed over, nobody is reading workflow logs, so each way this can rot has
to raise its own alarm (D12):

| Failure                           | What happens                                                         |
| --------------------------------- | -------------------------------------------------------------------- |
| A source breaks                   | Falls back if configured; the run reports it either way              |
| The sync fails                    | Previous snapshot kept, GitHub issue opened or updated               |
| The sync silently stops           | Deploy's freshness check opens an issue after 10 days                |
| Repository goes quiet for 60 days | Metadata is committed weekly regardless, so the schedule stays alive |

`npm run check:catalogue` reports the snapshot's age; `-- --strict` makes an
alarm a failing exit code, which is how the Deploy workflow raises it. It never
blocks a deploy — see D12.

### Keeping dependencies alive

Dependabot raises npm and Actions updates weekly. Minor and patch updates are
grouped into one pull request that `ci.yml` merges automatically once every
gate has passed on that commit; majors are ungrouped and wait for a person.

The merge is a job inside `ci.yml` with `needs: [e2e, budgets]`, not GitHub's
`gh pr merge --auto`. `--auto` waits on _required_ status checks, and this
repository has no branch protection deliberately: the nightly catalogue sync
pushes straight to `main`, which protection would block. `needs` gives the same
guarantee without the setting.

This exists because the site outlives its developer. Unmerged updates are not
a tidiness problem — skip a year of them and the deploy fails on a retired
Action rather than on anything anyone changed.

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

# Locked decisions

Each entry records what was decided, why, and what would have to change for it
to be revisited. Do not silently contradict these. To reverse one, open a PR
that amends the entry and states the new rationale.

---

## D1 — Astro over Next.js, Eleventy or WordPress

**Decided.** Astro 5 with TypeScript.

Astro ships static HTML and adds JavaScript only where a component asks for it,
which suits a brochure-and-booking-entry site hosted on GitHub Pages. It gives typed content
collections (invalid content fails the build), first-class image optimisation,
built-in i18n routing, and islands for the day the booking widget needs to be
interactive — without paying a framework runtime cost on every page.

Rejected: Next.js — static export fights GitHub Pages on `basePath` and asset
prefixes, and React's weight buys nothing here. Eleventy — fewer guardrails, no
typed content. WordPress — not free, not static, and a permanent security and
maintenance burden for a two-person salon.

_Revisit if:_ the site grows a genuine application surface (customer accounts,
on-site payments) that static hosting cannot serve.

---

## D2 — GitHub Pages, public repository

**Decided.** Free static hosting on GitHub Pages, from a public repository, with
`studiotaube.se` pointed at it via Loopia DNS.

GitHub Pages from a **private** repository requires a paid GitHub plan. This is
a marketing site containing no secrets and no customer data, so a public
repository costs nothing and removes that constraint. The domain is already
registered and currently parked at Loopia, so the only change needed is DNS.

_Consequence:_ no server-side code, ever. Forms and any future commerce must go
through a third party.

_Revisit if:_ the repository needs to hold anything confidential.

---

## D3 — Campaigns as content, no checkout

**Decided.** The site publishes campaigns, offers and gift-card _information_.
It does not process payments.

Every transaction happens in Bokadirekt. This keeps the site free to run, keeps
PCI and payment liability out of scope, and avoids the obligations that Swedish
distance-selling law (distansavtalslagen) attaches to online sales — terms,
right of withdrawal, returns handling, all of which would land on Linda.

The content model is nonetheless built so a product collection and a checkout
provider can be added without restructuring.

_Revisit if:_ Linda wants to sell gift cards or retail products directly. The
likely route is Stripe Payment Links (no monthly fee, per-transaction cost).

---

## D4 — Sveltia CMS for content editing

**Decided.** Sveltia CMS mounted at `/admin`, using the GitHub backend, with a
Cloudflare Worker acting as the OAuth relay.

Linda must be able to publish a campaign without touching git. Sveltia is a
git-based CMS: it commits Markdown to this repository, so content is versioned,
reviewable, and free — there is no database and no hosting bill. The Cloudflare
Worker exists only because GitHub OAuth needs a server-side token exchange; it
is on the free tier and holds no state.

_Consequence:_ content schemas must remain CMS-renderable. Clever TypeScript in
a schema that Sveltia cannot express is a defect.

Rejected: Decap CMS — same model but a less actively maintained editor. Tina
Cloud — free tier exists but introduces a vendor dependency for core content.

_Revisit if:_ Sveltia's maintenance stalls, or Linda finds the editor unusable.

---

## D5 — Swedish and English from day one

**Decided.** Swedish is the default locale at `/`, English at `/en/`.

Retrofitting i18n means migrating every content file and rewriting every route,
so it is cheaper to build for two locales now than to add the second later.
Nääs Fabriker draws visitors from outside the immediate area, which makes the
English surface worth its cost.

_Consequence:_ every content entry must exist in both locales or the build
fails. There is no silent fallback — a half-translated page is worse than an
obviously missing one.

---

## D6 — Booking through an abstraction, deep links first

**Decided.** All booking entry points resolve through `BookingProvider`.
v1 uses deep links to Bokadirekt.

Bokadirekt's terms as of this decision:

| Capability                                | Cost                              |
| ----------------------------------------- | --------------------------------- |
| Deep link to the salon or a treatment     | free, works today                 |
| Embed the booking button on your own site | free, included in normal packages |
| API & Webhooks module                     | 399 kr/mån                        |
| Webhooks only                             | 199 kr/mån                        |

Deep links need nothing from anyone and work immediately. The embed is free but
requires Linda to fetch the snippet from her Bokadirekt business account. The
API is a real monthly cost and should only be taken on if on-site booking
demonstrably converts better than the embed.

The abstraction means moving between these three is a configuration change, not
a rewrite.

_Revisit when:_ Linda supplies the embed snippet — that is a config change, not
a decision.

---

## D7 — No third-party tracking, cookieless analytics

**Decided.** Cloudflare Web Analytics. No Google Analytics, no Tag Manager, no
Meta pixel, no chat widget.

Cookieless analytics does not require a consent banner under the Swedish
implementation of the ePrivacy rules, which removes an entire class of legal
obligation and a piece of UI that hurts every metric on the page. Fonts are
self-hosted rather than loaded from Google's CDN, for the same reason as well
as for performance.

_Revisit if:_ Linda needs conversion attribution for paid advertising. That is a
real reason, and it changes the consent picture — do not add tracking without it.

---

## D8 — Palette derived from the existing brand, lightened

**Decided.** A warm, light, pastel palette anchored on the sand tone sampled
from the salon's own material (`#C2A88E`), with a warm charcoal (`#2B2622`)
replacing pure black.

The existing social-media identity is black-dominant, which reads as clinical
rather than welcoming. Lightening the palette while keeping their sand accent
preserves recognition for the audience that already follows them, and the
warm charcoal keeps text readable without the harshness of `#000`.

See `docs/DESIGN.md` for the full token set and contrast obligations.

---

## D9 — Bokadirekt is the source of truth for the catalogue

**Decided.** Treatment names, prices, durations and descriptions come from the
salon's Bokadirekt listing, captured in `data/bokadirekt-catalogue.json`.

The salon already maintains this data because bookings depend on it. Keeping a
second, hand-typed copy on the website would drift, and a wrong price on a
website is a customer-facing problem. `scripts/seed-content.mjs` turns the
snapshot into content entries and never overwrites an existing file, so edits
made in the CMS survive.

Spelling corrections applied to display names are listed in
`docs/CONTENT-REVIEW.md` for Linda to confirm. Prices, durations and ids are
never altered.

_Revisit if:_ Bokadirekt's API module is taken, at which point the catalogue
could refresh automatically instead of from a snapshot.

---

## D10 — Svelte 5 for interactivity

**Decided.** Svelte 5 as the island framework, via `@astrojs/svelte`.

JavaScript is welcome where it improves the page. Svelte was chosen over React
for a compiled output with no virtual DOM: the treatment filter costs about
16.5 kB gzipped including the runtime, where React's runtime alone is roughly
three times that before any component code. Astro loads it per-route, so the
home page still ships nothing.

The binding constraint is not the amount of JavaScript but where rendering
happens: **islands enhance server-rendered markup, they do not produce it.** The
catalogue must be in the delivered HTML for local search to work, which
`tests/e2e/treatment-filter.spec.ts` asserts by loading the page with scripts
disabled.

_Revisit if:_ a future feature genuinely needs client-side routing or shared
state across pages, which would be an argument for SvelteKit rather than for
React.

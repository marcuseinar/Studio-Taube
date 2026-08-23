# studiotaube.se

Website for **Studio Taube — Skönhet & Hälsa**, a beauty and skin-care studio at
Nääs Fabriker, Tollered.

Static site built with Astro, hosted free on GitHub Pages, with booking handled
by Bokadirekt.

## Status

Planning complete, implementation not yet started. The decisions are recorded —
read them before writing code.

| Document | Contents |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Working agreement for AI contributors. Read first. |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Locked decisions and their rationale |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Stack, routing, booking layer, CI, costs |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Palette, typography, components, logo |
| [`docs/CONTENT.md`](docs/CONTENT.md) | Content collections and writing guidance |

## Quick facts

- **Address:** Spinnerivägen 1, 448 50 Tollered
- **Booking:** [Bokadirekt](https://www.bokadirekt.se/places/studio-taube-56559)
- **Instagram:** [@linda_studiotaube](https://www.instagram.com/linda_studiotaube)
- **Languages:** Swedish (primary), English

## Commands

```bash
npm run dev       # local dev server
npm run verify    # everything CI runs — pass this before pushing
```

## Open items

- [ ] Confirm the current treatment list and prices with Linda — the flyer in
      `brand/source/` is from 2023 and is outdated
- [ ] Obtain the Bokadirekt embed snippet from Linda's business account
- [ ] Ask whether the designer's original logo vector exists
- [ ] Confirm photo usage rights and record them in `brand/CONSENT.md`
- [ ] Plan the DNS cutover from the parked Loopia page

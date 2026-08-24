# Image rights and consent

No photograph of an identifiable client may be published without recorded
consent. This file is the record.

## Status: NOT YET CONFIRMED

The images in `src/assets/photos/` are placeholders for the demo. Rights and
consent have not been confirmed with Linda.

| File                    | Source                                | Shows              | Identifiable people                                | Consent recorded |
| ----------------------- | ------------------------------------- | ------------------ | -------------------------------------------------- | ---------------- |
| head-spa-behandling.jpg | Studio Taube's own Bokadirekt profile | Head spa treatment | Therapist; client's face partly visible in profile | no               |
| linda.jpg               | Linda's Bokadirekt staff photo        | Linda              | Linda                                              | no               |
| head-spa-basin.jpg      | Instagram collage                     | Basin, hands only  | no                                                 | no               |
| produkter.jpg           | Instagram collage                     | Products           | no                                                 | no               |
| behandlingsrum.jpg      | Instagram collage                     | Treatment room     | no                                                 | no               |

## The hero video

The master runs 39 seconds and shows a client's face clearly for much of it.
The loop on the site is built from two shots only — water through the gold hoop,
and rinsing under it — chosen because **no face is recognisable in either**. The
crop and the in and out points in `scripts/build-hero-video.mjs` are what keep it
that way, so re-cutting the loop means re-checking that.

The master itself is kept in `brand/source/` for provenance and is never
published.

## Open questions for Linda

1. **The client in `head-spa-behandling.jpg`.** The photo is published on the
   salon's own Bokadirekt profile, so it is already public, but that is not the
   same as consent to reuse it on the website. Her face is partly visible in
   profile. Confirm, or swap the image.
2. **Who took these photos**, and does the studio hold the rights to publish
   them? A photographer retains copyright unless it was transferred.
3. **Full-resolution originals** would be better than these, which are
   downloads from Bokadirekt and social media.

## Correction on file

An earlier version of this site used a crop from the Instagram collage captioned
as Linda. Linda's own Bokadirekt staff photo shows a different person, so the
crop was misattributed. It has been removed, and the About page now uses her
actual staff photo. The therapist in `head-spa-behandling.jpg` is **not**
named in the alt text, because who is pictured has not been confirmed.

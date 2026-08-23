/**
 * Editorial layer over the raw Bokadirekt catalogue.
 *
 * Swedish titles here correct obvious spelling slips in the booking system
 * ("Ansiksbehandling" -> "Ansiktsbehandling"); prices, durations and ids are
 * never touched. Every correction is listed in docs/CONTENT-REVIEW.md for
 * Linda to confirm.
 *
 * English copy is a faithful translation of the salon's own text and is
 * marked `needs-review` until a human has checked it.
 */

export const CATEGORY_MAP = {
  388949: { kind: 'campaigns' },
  418182: { kind: 'services', slug: 'konsultation', featured: false },
  411629: { kind: 'services', slug: 'co2-laser', featured: true },
  375008: { kind: 'services', slug: 'head-spa', featured: true },
  373174: { kind: 'services', slug: 'ansiktsbehandlingar', featured: true },
  420107: { kind: 'services', slug: 'avancerad-hudvard', featured: false },
  365695: { kind: 'services', slug: 'lash-browlift', featured: true },
  365696: { kind: 'services', slug: 'fransforlangning', featured: false },
  365846: { kind: 'services', slug: 'fransar-bryn', featured: false },
  365847: { kind: 'services', slug: 'tandblekning', featured: false },
  373071: { kind: 'services', slug: 'massage', featured: false },
  386346: { kind: 'services', slug: 'elevbehandlingar', featured: false },
};

export const SKIP_SERVICE_IDS = new Set();

export const CATEGORY_LABELS = {
  konsultation: { sv: 'Konsultation', en: 'Consultation' },
  ansiktsbehandlingar: { sv: 'Ansiktsbehandlingar', en: 'Facials' },
  'avancerad-hudvard': { sv: 'Avancerad hudvård', en: 'Advanced skincare' },
  'co2-laser': { sv: 'CO2-laser', en: 'CO2 laser' },
  'head-spa': { sv: 'Head spa', en: 'Head spa' },
  'lash-browlift': { sv: 'Lash & browlift', en: 'Lash & brow lift' },
  fransforlangning: { sv: 'Fransförlängning', en: 'Lash extensions' },
  'fransar-bryn': { sv: 'Fransar & bryn', en: 'Lashes & brows' },
  massage: { sv: 'Massage', en: 'Massage' },
  tandblekning: { sv: 'Tandblekning', en: 'Teeth whitening' },
  elevbehandlingar: { sv: 'Elevbehandlingar', en: 'Student treatments' },
};

export const SERVICE_EN = {
  3372866: {
    svTitle: 'Konsultation CO2-laser (obligatorisk)',
    svSummary: 'Kostnadsfri konsultation som krävs innan du bokar en laserbehandling.',
    title: 'CO2 laser consultation (required)',
    summary: 'A free consultation, required before booking any laser treatment.',
    body: 'Before you book your CO2 laser treatment we ask you to come in for a free consultation, so you have all the information you need about the treatment and the aftercare, and feel confident going into it.',
  },
  3424039: {
    svTitle: 'Konsultation hudvård',
    svSummary: 'Kostnadsfri genomgång av vad just din hud behöver.',
    title: 'Skincare consultation',
    summary: 'A free conversation about what your skin needs.',
    body: 'A consultation for anyone who wants to know more about our skincare. We go through what your skin needs and what you would like to work on.',
  },

  3372890: {
    svTitle: 'CO2-laser uppstramning runt munnen',
    svSummary: 'Fraktionerad CO2-laser för området runt munnen. Konsultation krävs innan behandling.',
    title: 'CO2 laser – firming around the mouth',
    summary: 'Fractional CO2 laser for the area around the mouth. A consultation is required first.',
    body: 'With fractional CO2 laser, focused on the area around the mouth.\n\nPlease book a consultation before this treatment.',
  },
  3372894: {
    svTitle: 'CO2-laser händer',
    svSummary: 'Fraktionerad CO2-laser för huden på händerna.',
    title: 'CO2 laser – hands',
    summary: 'Fractional CO2 laser for the skin on your hands.',
    body: 'With fractional CO2 laser we work on the skin of the hands.\n\nPlease book a consultation before this treatment.',
  },
  3372892: {
    svTitle: 'CO2-laser uppstramning av ögonområde',
    svSummary: 'Fraktionerad CO2-laser för ögonområdet. Konsultation krävs innan behandling.',
    title: 'CO2 laser – firming the eye area',
    summary: 'Fractional CO2 laser for the eye area. A consultation is required first.',
    body: 'With fractional CO2 laser we work on firming the eye area.\n\nPlease book a consultation before this treatment.',
  },
  3372887: {
    svTitle: 'Cool Peel CO2-laser ansikte + exosomer',
    svSummary: 'Cool Peel-behandling för hudens struktur, kombinerad med exosomer.',
    title: 'Cool Peel CO2 laser – face + exosomes',
    summary: 'A Cool Peel treatment for skin texture, combined with exosomes.',
    body: 'With a Cool Peel treatment we work on fine lines and wrinkles, sun damage, pores, acne and the texture of the skin.\n\nPlease book a consultation before this treatment.',
  },

  3077572: {
    svTitle: 'Head spa 60 minuter',
    svSummary: 'En lugn behandling för hårbotten, hår och ansikte.',
    title: 'Head spa 60 minutes',
    summary: 'A calm treatment for your scalp, hair and face.',
    body: 'A treatment for when you need to slow down.\n\nThis treatment includes:\n\n- **Steam bath for hair and face** — moisturises the hair and scalp and smooths the hair\n- **Facial massage** — cleansing and massage with oil. Good if you carry tension in your shoulders or get tension headaches\n- **Hair massage** — improves circulation, and helps lift away the build-up of oils and product residue that can block the follicles\n- **Herbs & Clay peeling** — a 100% natural cleansing scalp peel\n- **Peeling for face, chest and hands**',
  },
  3138993: {
    svTitle: 'Head & face spa lyx',
    svSummary: 'En längre och lyxigare head spa med fokus på inpackning och hudvård.',
    title: 'Head & face spa luxury',
    summary: 'A longer, more indulgent head spa focused on masks and skincare.',
    body: 'A slightly longer and more luxurious head spa, with longer steps and a focus on masks and skincare. If you have long or thick hair, we recommend this one.',
  },

  3115245: {
    svTitle: 'Ansiktsbehandling classic',
    svSummary: 'En ansiktsbehandling som rengör och återfuktar, skräddarsydd för din hud.',
    title: 'Classic facial',
    summary: 'A cleansing and moisturising facial, tailored to your skin.',
    body: 'A facial that cleanses and moisturises.\n\nWhat is included (tailored to your skin):\n\n- Cleansing\n- Peeling\n- Facial massage with an ampoule\n- A mask chosen for your needs\n\nSuitable for everyone.',
  },
  3414968: {
    svTitle: 'Ansiktsbehandling express',
    svSummary: 'En kortare behandling med fokus på lyster — perfekt före festen.',
    title: 'Express facial',
    summary: 'A shorter treatment focused on glow — perfect before an event.',
    body: 'The express facial is perfect when you have less time. It fits into a lunch break, or before a party. We focus on glow, and tailor it to suit you. Suitable for all skin types.',
  },
  3439810: {
    svTitle: 'Ansiktsbehandling tonår',
    svSummary: 'En ansiktsbehandling anpassad för tonårshud.',
    title: 'Teen facial',
    summary: 'A facial adapted for teenage skin.',
    body: 'A facial adapted for teenage skin.',
  },

  3172185: {
    svTitle: 'Ansiktsbehandling Dr. Schrammek Green Peel',
    svSummary: 'Naturlig örtpeeling som utförs på salong. Du väljer variant tillsammans med din terapeut.',
    title: 'Dr. Schrammek Green Peel facial',
    summary: 'A natural herbal peeling performed in the salon. You choose the variant together with your therapist.',
    body: 'Dr. Schrammek Green Peel is a 100% natural, active herbal peeling performed in the salon.\n\nWhen you come in, you choose one of these treatments together with your therapist:\n\n**Green Peel Fresh Up, 50 minutes — 1 450 kr**\nThe milder variant, suitable for all skin types including sensitive skin. Also known as the "party peel".\n\nPlease ask us which variant suits you.',
  },

  3051765: {
    svTitle: 'Browlift & lashlift inkl. färgning',
    svSummary: 'Lashlift och browlift i samma besök, inklusive färgning.',
    title: 'Brow lift & lash lift incl. tint',
    summary: 'A lash lift and a brow lift in one visit, tint included.',
    body: 'A brow lift and a lash lift in the same appointment, including tinting.',
  },
  2999025: {
    svTitle: 'Browlift inkl. färg & form',
    svSummary: 'Browlift med färgning och formning av brynen.',
    title: 'Brow lift incl. tint & shaping',
    summary: 'A brow lift with tinting and shaping.',
    body: 'A brow lift including tinting and shaping of the brows.',
  },
  2999023: {
    svTitle: 'Lashlift inkl. brynformning & brynfärg',
    svSummary: 'Lashlift kombinerad med formning och färgning av brynen.',
    title: 'Lash lift incl. brow shaping & brow tint',
    summary: 'A lash lift combined with brow shaping and tinting.',
    body: 'A lash lift combined with shaping and tinting of the brows.',
  },
  2999021: {
    svTitle: 'Lashlift inkl. färgning',
    svSummary: 'Dina egna fransar böjs upp och färgas. Håller ca 6–8 veckor.',
    title: 'Lash lift incl. tint',
    summary: 'Your own lashes are lifted and tinted. Lasts around 6–8 weeks.',
    body: 'With a lash lift your own lashes are curled upwards and tinted. A small rod is placed on the eyelid and the lashes are combed up. Once they are curled they are tinted, and a serum is applied for the best result.\n\nThe result lasts around 6–8 weeks.',
  },

  2999010: {
    svTitle: 'Borttagning av fransar',
    svSummary: 'Skonsam borttagning av fransförlängning.',
    title: 'Lash extension removal',
    summary: 'Gentle removal of lash extensions.',
    body: 'Gentle removal of lash extensions.',
  },
  2998995: {
    svTitle: 'Fransförlängning singel',
    svSummary: 'En frans fästs på varje egen frans. Längd och form går vi igenom innan.',
    title: 'Lash extensions – classic',
    summary: 'One extension is applied to each natural lash. We agree on length and shape first.',
    body: 'Lash extensions using the classic method: one extension is attached to each of your own lashes. We go through length and shape before the treatment.',
  },
  2998997: {
    svTitle: 'Fransförlängning volym',
    svSummary: 'Fransar sätts i små knippen — från naturligt till mer glamouröst.',
    title: 'Lash extensions – volume',
    summary: 'Lashes are applied in small fans — from natural to more glamorous.',
    body: 'With volume lash extensions, 1–5 lashes are applied in small fans. How many depends on how full you want the result and on your own lashes. It can be kept very natural, or made more glamorous. We go through what you would like beforehand.',
  },
  2999004: {
    svTitle: 'Fransförlängning återbesök 120 min',
    svSummary: 'Återbesök efter 3–4 veckor när du önskar mer volym.',
    title: 'Lash extensions – refill 120 min',
    summary: 'A refill after 3–4 weeks, when you would like more volume.',
    body: 'A refill after 3–4 weeks, for when you would like more volume.',
  },
  2999000: {
    svTitle: 'Fransförlängning återbesök 90 min',
    svSummary: 'Återbesök mellan 3–4 veckor.',
    title: 'Lash extensions – refill 90 min',
    summary: 'A refill within 3–4 weeks.',
    body: 'A refill within 3–4 weeks.',
  },

  3001528: {
    svTitle: 'Formning av bryn inkl. färg',
    svSummary: 'Formning och färgning av brynen.',
    title: 'Brow shaping incl. tint',
    summary: 'Shaping and tinting of the brows.',
    body: 'Shaping and tinting of the brows.',
  },
  3001527: {
    svTitle: 'Färgning fransar & bryn',
    svSummary: 'Färgning av både fransar och bryn.',
    title: 'Lash & brow tint',
    summary: 'Tinting of both lashes and brows.',
    body: 'Tinting of both lashes and brows.',
  },

  3115249: {
    svTitle: 'Kosmetisk tandblekning',
    svSummary: 'Rengör tänderna från beläggningar. Bleker inte emaljen.',
    title: 'Cosmetic teeth whitening',
    summary: 'Removes surface staining from the teeth. Does not bleach the enamel.',
    body: 'Cosmetic teeth whitening cleans the teeth of surface deposits from coffee, tea, wine and so on, and lightens them by 2–9 shades. It does not bleach the enamel.\n\nIf there is a lot of surface staining, more than one treatment may be needed to reach the result you want.',
  },

  3063353: {
    svTitle: 'Ansiktsmassage',
    svSummary: 'Avslappnande ansiktsmassage i spa-anda med ekologiska produkter.',
    title: 'Facial massage',
    summary: 'A relaxing spa-style facial massage with organic products.',
    body: 'A spa-style facial massage. Relaxing for both muscles and mind, with organic products.\n\n- Cleansing\n- Facial massage\n- Décolletage\n- Scalp',
  },
  3158573: {
    svTitle: 'Överkroppsmassage (skalp, ansikte, axlar och armar)',
    svSummary: 'Massage av överkroppens framsida, med fokus på skalp och ansikte.',
    title: 'Upper body massage (scalp, face, shoulders and arms)',
    summary: 'Massage of the front of the upper body, focused on the scalp and face.',
    body: 'A massage focused on the front of the upper body. It is deeply relaxing, and because we focus on the scalp and face it also helps those who get tension headaches.\n\nThe scalp and skin are cleansed carefully before the massage, which finishes with a hand and arm massage.',
  },

  3159657: {
    svTitle: 'Browlift (elev)',
    svSummary: 'Browlift som utförs av elev till reducerat pris. Lärare finns på plats.',
    title: 'Brow lift (student)',
    summary: 'A brow lift performed by a student at a reduced price. A teacher is present.',
    body: 'The brow lift is performed by a student. The student has come far enough in her training to take clients at a reduced price. A teacher is present throughout.',
  },
  3159651: {
    svTitle: 'Fransförlängning singel (elev)',
    svSummary: 'Fransförlängning av elev till reducerat pris. Tiden är något längre.',
    title: 'Lash extensions – classic (student)',
    summary: 'Lash extensions by a student at a reduced price. The appointment is slightly longer.',
    body: 'Classic lash extensions performed by a student. The student has come far enough to take clients at a reduced price, though the appointment takes a little longer. A teacher is present throughout.',
  },
  3159653: {
    svTitle: 'Lashlift (elev)',
    svSummary: 'Lashlift som utförs av elev till reducerat pris. Lärare finns på plats.',
    title: 'Lash lift (student)',
    summary: 'A lash lift performed by a student at a reduced price. A teacher is present.',
    body: 'The lash lift is performed by a student who has completed her lash lift training and now takes clients at a reduced price. A teacher is present throughout.',
  },
  3424030: {
    svTitle: 'Lashlift & browlift inkl. färg (elev)',
    svSummary: 'Lashlift och browlift med färgning, utförd av elev.',
    title: 'Lash lift & brow lift incl. tint (student)',
    summary: 'A lash lift and brow lift with tinting, performed by a student.',
    body: 'A lash lift and brow lift including tinting, performed by a student. A teacher is present throughout.',
  },
};

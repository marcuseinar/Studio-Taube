/**
 * Swedish is the source language. Every other locale is typed against this
 * object, so a missing translation is a compile error rather than a silent
 * fallback. See CLAUDE.md §9.
 */
export const sv = {
  'nav.home': 'Hem',
  'nav.treatments': 'Behandlingar',
  'nav.prices': 'Priser',
  'nav.campaigns': 'Erbjudanden',
  'nav.about': 'Om oss',
  'nav.contact': 'Kontakt',
  'nav.skipToContent': 'Hoppa till innehåll',
  'nav.menu': 'Meny',

  'booking.cta.primary': 'Boka tid',
  'booking.cta.service': 'Boka behandling',
  'booking.opensExternally': 'Öppnas hos Bokadirekt i ny flik',
  'booking.consultationRequired': 'Kostnadsfri konsultation krävs innan behandling',

  'treatments.title': 'Behandlingar',
  'treatments.intro': 'Hudvård, laser, fransar och bryn, massage och head spa — hos oss i Nääs Fabriker.',
  'treatments.allCategories': 'Alla behandlingar',
  'treatments.duration': 'Tid',
  'treatments.price': 'Pris',
  'treatments.readMore': 'Läs mer',
  'treatments.performedBy': 'Utförs av',

  'campaigns.title': 'Erbjudanden',
  'campaigns.none': 'Inga aktiva erbjudanden just nu.',
  'campaigns.validUntil': 'Gäller till',
  'campaigns.ordinaryPrice': 'Ordinarie pris',

  'contact.title': 'Kontakt',
  'contact.address': 'Adress',
  'contact.phone': 'Telefon',
  'contact.email': 'E-post',
  'contact.openingHours': 'Öppettider',
  'contact.closed': 'Stängt',
  'contact.findUs': 'Hitta hit',
  'contact.viewOnMap': 'Visa på karta',

  'about.title': 'Om oss',
  'about.staff': 'Vi som jobbar här',

  'weekday.1': 'Måndag',
  'weekday.2': 'Tisdag',
  'weekday.3': 'Onsdag',
  'weekday.4': 'Torsdag',
  'weekday.5': 'Fredag',
  'weekday.6': 'Lördag',
  'weekday.0': 'Söndag',

  'footer.followUs': 'Följ oss',
  'footer.bookVia': 'Boka via',
  'footer.privacy': 'Integritetspolicy',
  'footer.rights': 'Alla rättigheter förbehållna',

  'language.switchTo': 'In English',
  'language.current': 'Svenska',
} as const;

export type TranslationKey = keyof typeof sv;

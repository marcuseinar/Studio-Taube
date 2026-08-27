/**
 * Reads the catalogue out of the public salon page.
 *
 * This is the source that needs no credentials and no subscription, which is
 * why it is still the default. It is also the fragile one: the catalogue is a
 * JSON blob embedded in a page Bokadirekt can restyle whenever they like, and
 * nothing warns us before it changes. That fragility is the argument for the
 * API source next to this one — see docs/DECISIONS.md D12.
 */
import { parseCatalogue } from '../parse-bokadirekt.mjs';

const SALON_URL = 'https://www.bokadirekt.se/places/studio-taube-56559';

/* Bokadirekt serves a different page to clients it does not recognise as a
   browser, and the embedded catalogue is missing from it. */
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
  'Accept-Language': 'sv-SE,sv;q=0.9',
};

export const salonPageSource = {
  name: 'salon-page',

  describe: () => SALON_URL,

  async fetchCatalogue({ fetchImpl = fetch } = {}) {
    const response = await fetchImpl(SALON_URL, { headers: BROWSER_HEADERS });

    if (!response.ok) {
      throw new Error(`Bokadirekt returned ${response.status} for the salon page.`);
    }

    return parseCatalogue(await response.text());
  },
};

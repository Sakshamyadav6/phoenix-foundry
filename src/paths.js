// Where the site root is relative to the current page, so links and images work from both
// the home page and /apply/, and from any folder the site is deployed in.
// Each HTML page declares it: <body data-root="../"> on /apply/, nothing on the home page.
export const ROOT = (typeof document !== 'undefined' && document.body.dataset.root) || '';
export const HOME = ROOT || './';
export const APPLY = `${ROOT}apply/`;

/** Resolve a site-relative file (e.g. 'logo.png') from the current page; full URLs pass through. */
export const asset = (p) => (!p || /^(https?:|data:|\/)/.test(p) ? p : ROOT + p);

// Locale registry. Single source of truth for which languages the site
// currently ships and which it will eventually ship.
//
// `active`  — locales whose pages are built and indexed today. The
//             language switcher only renders these.
// `planned` — locales for which we have machinery prepared but no
//             content yet. Don't render anything UI-facing for these
//             — they're documentation.
// `default` — the canonical "home" locale that lives at the root URL
//             (not under /xx/). English keeps athlos.fi/ to preserve
//             existing SEO authority and inbound links.
// `labels`  — human-readable names used by the language switcher.
//             Each label is written in the language it represents.

export default {
  active: ["en", "de", "it"],
  planned: ["fr", "es"],
  default: "en",
  labels: {
    en: "English",
    de: "Deutsch",
    fr: "Français",
    it: "Italiano",
    es: "Español",
  },
};

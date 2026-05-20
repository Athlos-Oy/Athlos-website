# French (fr-FR) style and terminology decisions

Binding style guide for the French translation in `i18n/fr.json` +
`i18n/parts-fr/*.json`. Resolves the `PROPOSED — FR` entries in
`i18n/glossary.md`. Mirrors the structure of `i18n/de-style-decisions.md`,
`i18n/it-style-decisions.md`, and `i18n/es-style-decisions.md`.

**Status:** First-draft decisions made for the French launch. All entries
remain PROPOSED until a native French technical reviewer signs off.

**Target locale:** fr-FR (France). European / France B2B technical
register. Canadian French (fr-CA) is explicitly out of scope — if it
becomes commercially important later, plan a separate locale rather than
mixing variants.

---

## Address and register

| Rule | Decision |
|---|---|
| Address form | **Vous** (formal) throughout. Athlos's audience is B2B (engineers, procurement, dental/medical OEMs, distributors). Never use "tu". |
| Tone | Premium, restrained, technically credible. Avoid exclamation marks and marketing superlatives unless the source uses them. |
| Sentence length | French naturally builds long subordinate-clause sentences; resist it. Prefer short, clear sentences — better for B2B credibility and for button/card layouts. |

## Typographic non-breaking space — mandatory

French requires a non-breaking space before `:` `;` `!` `?` and inside the
`« … »` quotation marks. In all **page-facing** strings this is written as
the HTML entity `&nbsp;` (consistent with the existing `&reg;`, `&amp;`
markup; the `t` filter returns a SafeString so entities render correctly).

- **JSON-LD strings** (`jsonld.*` keys and `i18n/parts-fr/jsonld-*.json`)
  use plain text with regular spaces and NO HTML entities — entities are
  not decoded inside `<script type="application/ld+json">`. A regular
  space before `?` is standard for machine-readable structured data.
- **SEO/meta strings** (`pages.*.title`, `.description`, `.og.*`,
  `.twitter.*`) avoid `&nbsp;` to keep them safe for any context; they are
  phrased to avoid mid-sentence `:` `;` where possible.

## "Direct conversion" — the core brand concept

| English | French | Notes |
|---|---|---|
| direct conversion *(prose)* | **conversion directe** | |
| Direct Conversion *(title-case branded phrase)* | **Conversion Directe** | Capitalised when the source treats it as a brand name. |
| direct conversion sensor | **capteur à conversion directe** | |
| direct conversion imaging | **imagerie à conversion directe** | |
| direct conversion technology | **technologie de conversion directe** | |
| direct conversion X-ray imaging | **imagerie à rayons X par conversion directe** | Per the project terminology brief. |
| indirect conversion | **conversion indirecte** | |

## X-ray family

| English | French | Notes |
|---|---|---|
| X-ray *(phenomenon)* | **rayons X** | |
| X-ray imaging *(discipline)* | **imagerie par rayons X** | |
| X-ray sensor | **capteur à rayons X** | Per the project terminology brief — overrides the glossary's earlier "capteur de rayons X". |
| X-ray photon(s) | **photon(s) X** | |
| X-ray detector | **détecteur de rayons X** | |
| X-ray *(a single clinical/inspection image)* | **radiographie** | Used for gallery alt texts and individual images. |

## Technical detail terms

| English | French |
|---|---|
| scintillator | **scintillateur** |
| photodiode | **photodiode** |
| fill factor | **facteur de remplissage** |
| dynamic range | **plage dynamique** |
| signal loss | **perte de signal** |
| blur | **flou** |
| sharpness | **netteté** |
| contrast resolution | **résolution de contraste** |
| image quality | **qualité d'image** |
| photon counting | **comptage de photons** |
| single-photon sensitivity / single-photon-sensitive | **sensibilité au photon unique** / **sensible au photon unique** |
| low-dose / at low dose | **à faible dose** |
| readout (CMOS readout) | **lecture (lecture CMOS)** |
| reconstruction | **reconstruction** |
| post-processing | **post-traitement** |
| filter (image processing) | **filtre** |
| acquisition | **acquisition** |
| line-scan / scanning | **balayage** |
| scanning sensor | **capteur à balayage** |
| linear scanning sensor | **capteur linéaire à balayage** |
| linear detector array | **barrette de détection linéaire** |
| line rate | **cadence ligne** |
| frame mode / TDI mode | **mode trame** / **mode TDI** |
| workflow | **flux de travail** |
| docking station | **station d'accueil** |
| cleanroom | **salle blanche** |

## Application domains

| English | French |
|---|---|
| dental | **dentaire** |
| medical | **médical** |
| industrial | **industriel** |
| intraoral / extraoral | **intraoral** / **extraoral** |
| panoramic | **panoramique** |
| cephalometric | **céphalométrique** / **céphalométrie** *(noun)* |
| inline inspection | **inspection en ligne** |
| inspection / quality control | **inspection** / **contrôle** / **contrôle qualité** |
| foreign object detection | **détection de corps étrangers** |
| seal integrity | **intégrité des scellages** *(packaging seals)* |
| weld inspection | **contrôle des soudures** |
| non-destructive testing (NDT) | **contrôle non destructif (CND)** |
| industrial CT | **CT industriel** |

## Materials / acronyms — KEEP-EN

CdTe, Si, CMOS, CdTe-CMOS, Si-CMOS, InSn, Cu, DQE, TDI, MTF, ASIC, IP67,
ISO 13485:2016, FDA, FDA 510(k), CE, TWAIN, SDK, API, DLL, Bluetooth,
BLE, GigE, Gigabit Ethernet, PPSU, LINAC, SMT, OPG, OEM, GDPR→RGPD,
"bumping", "flip chip", "die bonding", "bump bonding", "wire bonding"
rendered "câblage filaire". Process anglicisms (bumping, flip chip, die
bonding) are retained — standard in French microelectronics.

## Product / brand names — KEEP-EN

Athlos, Athlos Oy, DC-Air®, WIOS, UFS, UFS150/225/460, Industrial IP67
TDI, Ultra-Fast Scanning Sensor, True Wireless®, Zero Profile®, Simage Oy,
Ajat Oy, Oy Direct Conversion Ltd., Varex Imaging Finland Ltd., VTT
Micronova, Cefla, Konstantinos Spartiotis, Clinicians Report, CR
Foundation, "First Look" — verbatim, ® symbols preserved. Software
platform names (Dentrix Ascend, Eaglesoft, Open Dental, Dexis, Romexis,
TigerView, Acteon, Apteryx, XDR Radiology) and the cited CR publication
title stay in English.

## Regulatory wording

| English | French |
|---|---|
| FDA-cleared / FDA 510(k) cleared | **autorisé par la FDA** / **autorisé par la FDA au titre du 510(k)** *(full)* / **Autorisé FDA 510(k)** *(short label)* |
| ISO 13485:2016 certified | **certifié ISO 13485:2016** |
| CE registration is under way | **l'enregistrement CE est en cours** |

**Conservatism rule:** "cleared" → "autorisé", never "approuvé" or
"homologué" (which imply a stronger / different regulatory act). This
overrides the glossary's earlier proposed "homologué par la FDA" and
keeps French consistent with the resolved Spanish decision ("autorizado
por la FDA"). Never strengthen a regulatory claim beyond the English.

## UI / chrome

| English | French |
|---|---|
| Home | **Accueil** |
| Products | **Produits** |
| Applications | **Applications** |
| About | **À propos** |
| About Athlos | **À propos d'Athlos** |
| Contact | **Contact** |
| Explore Products | **Voir les produits** |
| Explore [product] | **Découvrir [product]** |
| Learn more | **En savoir plus** |
| Contact Athlos | **Contacter Athlos** |
| Get in Touch | **Nous contacter** |
| All Products | **Tous les produits** |
| Download / Download PDF / Download Brochure | **Télécharger** / **Télécharger le PDF** / **Télécharger la brochure** |
| Manufacturing Services | **Services de fabrication** |
| Software Products | **Produits logiciels** |
| Privacy Policy | **Politique de confidentialité** |
| All rights reserved. | **Tous droits réservés.** |
| Made in Finland. | **Fabriqué en Finlande.** |
| Last updated: | **Dernière mise à jour&nbsp;:** |
| Business ID | **Numéro d'entreprise** |
| VAT | **Numéro de TVA** |

## Numerals and typography

- **Decimal comma**: `3,2 mm` (not 3.2 mm).
- **Thousands separator**: non-breaking space written `&nbsp;` —
  `75&nbsp;000 lps`, `1&nbsp;920 m/min`, `2&nbsp;000 m²`.
- **Units**: regular space between number and unit (`30 m/min`, `9 MeV`).
  "16-bit" → "16 bits".
- **Version numbers stay dotted**: `Bluetooth 5.0`, `BLE 5.0` (product
  version, not a decimal value).
- **Quotation marks**: French guillemets `«&nbsp;…&nbsp;»` in body copy.
- **Ellipsis**: the single character `…`.
- **Em-dash** `—` for parenthetical asides; en-dash for ranges
  (`10–360 kV`, `10 – 40 °C`) matching the English source.

## Things to be conservative about

- **Regulatory claims** — never strengthen (see Regulatory wording).
- **Performance figures** — keep every numeric value exactly; only swap
  the decimal separator and the thousands separator. No rounding, no unit
  conversion.
- **Patent language** — only claim "breveté" where the English claims
  "patented".
- **Founder / company history** — dates, company names, university names
  verbatim; no transliteration of "Konstantinos Spartiotis".
- **Legal / privacy text** — translated faithfully; legal meaning never
  changed; still requires legal review before reliance (see report).

## Pending decisions to flag for the native reviewer

These were judgement calls; the native French reviewer should confirm or
override:

1. **"capteur à rayons X" vs "capteur de rayons X"** — chose "à" per the
   project terminology brief. "de" is also common in French technical
   copy; reviewer to confirm one form site-wide.
2. **"autorisé par la FDA" vs "homologué par la FDA"** — chose "autorisé"
   for conservatism and ES consistency. Reviewer to confirm against
   French medical-device industry usage.
3. **"Numéro d'entreprise" / "Numéro de TVA"** — neutral footer labels
   chosen because Athlos is Finnish; French "SIREN/SIRET" labels would be
   factually wrong. Reviewer may prefer other neutral wording.
4. **"seal integrity" → "intégrité des scellages"** — generic packaging
   term chosen; some food-industry contexts use "soudure" (heat-seal
   weld). Reviewer to confirm per sector.
5. **"bumping" / "flip chip" / "die bonding"** kept in English —
   standard in French microelectronics. Reviewer to confirm register.
6. **"V CC" for "V DC"** — used the French "courant continu" form.
   Reviewer may prefer the retained English "V DC" common on datasheets.
7. **"Bitewing" → "rétrocoronaire"** — French clinical term chosen over
   the retained-English "bite-wing". Reviewer to confirm dental register.
8. **"Image Accuracy"** (branded EN phrase in the home statement) —
   rendered faithfully as "précision et fidélité" rather than left in
   English. Reviewer to confirm.

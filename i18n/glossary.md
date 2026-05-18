# Athlos translation glossary

Canonical translations for technical, regulatory, and brand terms used across
the Athlos website. This file is the **binding reference** for every translator
and native reviewer working on any locale. When a term in this glossary
appears in source copy, the translation listed here must be used — no
synonyms, no creative variants, no per-page drift.

## How to use this file

1. **Translator** — before drafting a locale file, read this glossary end to
   end. While translating, treat any term that appears here as a fixed token:
   use the listed translation exactly. If a term you encounter isn't in the
   glossary but feels like it should be, flag it instead of inventing a
   translation.
2. **Native technical reviewer** — your first pass is a glossary-compliance
   check: every term in this file must be used consistently across the locale.
   Your second pass is for fluency, register, and technical accuracy.
3. **Engineer / content editor** — if you introduce a new technical or brand
   term in English source copy, add it to this glossary (English column only)
   and open a ticket for each active locale before shipping. Do not let
   untranslated terms slip into a locale file unreviewed.

## Confidence convention

Each row carries a status flag:

- **PINNED** — confirmed by a native technical reviewer for that locale. Do
  not change without re-review.
- **PROPOSED** — first-draft translation provided here as a starting point.
  Must be confirmed (or replaced) by the native technical reviewer for that
  locale before the first launch of that language. Do not ship a locale with
  PROPOSED rows still unresolved.
- **KEEP-EN** — the term stays in English in every locale (brand name,
  international acronym, regulatory designation, or product model number).

Until the German launch (Phase 4), every DE row should be treated as PROPOSED
and confirmed during the reviewer pass. FR / IT / ES rows are PROPOSED and
will be re-confirmed at the start of each language's own Phase 4.

---

## 1. Brand, product, and company names — KEEP-EN

These never get translated, declined, transliterated, or capitalised
differently. Use them verbatim, including the registered/trademark marks where
shown.

| English (canonical) | All locales | Notes |
|---|---|---|
| Athlos | Athlos | Company short name. |
| Athlos Oy | Athlos Oy | Legal entity. "Oy" stays — do not translate to GmbH / SAS / S.r.l. / S.L. |
| DC-Air® | DC-Air® | Always with the ® symbol on first prominent use per page. |
| Ultra-Fast Scanning Sensor | Ultra-Fast Scanning Sensor | Product family name. May be abbreviated as "UFS" after first use, same as English. |
| UFS150, UFS225, UFS460 | UFS150, UFS225, UFS460 | Model designations. |
| Industrial IP67 TDI | Industrial IP67 TDI | Product name. |
| True Wireless® | True Wireless® | Always with ®. |
| Simage Oy | Simage Oy | Historical company name. |
| Ajat Oy / Oy Ajat Ltd. | Ajat Oy / Oy Ajat Ltd. | Historical company name. |
| Oy Direct Conversion Ltd. | Oy Direct Conversion Ltd. | Historical company name (post-2019 rename). |
| Varex Imaging Finland Ltd. | Varex Imaging Finland Ltd. | Historical company name (post-2023 rename). |
| VTT Micronova | VTT Micronova | Cleanroom facility name. |
| Cefla | Cefla | Partner/customer brand. |
| Konstantinos Spartiotis | Konstantinos Spartiotis | Founder. Do not transliterate or localise. |

## 2. Regulatory and standards designations — KEEP-EN

Regulatory designations are jurisdiction-bound proper nouns. Translating them
weakens the claim and is technically incorrect.

| English (canonical) | All locales | Notes |
|---|---|---|
| FDA | FDA | Never expand to "U.S. Food and Drug Administration" in a locale unless the source does. |
| FDA 510(k) | FDA 510(k) | Including the parentheses and lowercase "k". |
| FDA-cleared / FDA 510(k) cleared | See per-locale verb forms below | The designation stays in English; the surrounding verb is localised. |
| ISO 13485:2016 | ISO 13485:2016 | Standard designation. |
| CE | CE | If introduced in source copy in future. |
| IP67 | IP67 | Ingress protection rating. |

**Per-locale verb forms for "FDA-cleared":**

| Locale | Form |
|---|---|
| DE | FDA-zugelassen *(PROPOSED — reviewer to confirm against medical-device industry usage in DE)* |
| FR | homologué par la FDA *(PROPOSED)* |
| IT | autorizzato dalla FDA *(PROPOSED)* |
| ES | autorizado por la FDA *(PROPOSED)* |

## 3. Core technology terms

These are the load-bearing terms of Athlos's positioning. Consistency here
matters more than anywhere else on the site. If a translator deviates from
these, the entire technical pitch loses coherence.

| English | DE | FR | IT | ES | Status |
|---|---|---|---|---|---|
| direct conversion | direkte Konversion | conversion directe | conversione diretta | conversión directa | PROPOSED |
| Direct Conversion (capitalised, as a branded concept) | Direkte Konversion | Conversion Directe | Conversione Diretta | Conversión Directa | PROPOSED — keep the title-case treatment that English uses when it appears as a branded phrase in marketing copy. |
| direct conversion sensor | Direktkonversionssensor | capteur à conversion directe | sensore a conversione diretta | sensor de conversión directa | PROPOSED |
| direct conversion imaging | direkte Röntgenbildgebung mittels Konversion *(literal; reviewer may prefer the shorter "Direktkonversions-Bildgebung")* | imagerie à conversion directe | imaging a conversione diretta | imagen por conversión directa | PROPOSED — DE reviewer must pick one form and apply it everywhere. |
| indirect conversion | indirekte Konversion | conversion indirecte | conversione indiretta | conversión indirecta | PROPOSED |
| scintillator | Szintillator | scintillateur | scintillatore | centellador | PROPOSED |
| photon | Photon | photon | fotone | fotón | PROPOSED |
| X-ray photon | Röntgenphoton | photon X | fotone X | fotón de rayos X | PROPOSED |
| X-ray | Röntgenstrahlung *(physical phenomenon)* / Röntgen- *(compound prefix, e.g. Röntgenbild)* | rayons X | raggi X | rayos X | PROPOSED — DE reviewer must confirm context-sensitive use; "X-ray imaging" → "Röntgenbildgebung", "X-ray sensor" → "Röntgensensor". |
| X-ray imaging | Röntgenbildgebung | imagerie par rayons X | imaging a raggi X / radiografia | imagen por rayos X | PROPOSED |
| X-ray sensor | Röntgensensor | capteur de rayons X | sensore a raggi X | sensor de rayos X | PROPOSED |
| photon counting | Photonenzählung | comptage de photons | conteggio dei fotoni | conteo de fotones | PROPOSED |
| single-photon sensitivity | Einzelphotonen-Empfindlichkeit | sensibilité au photon unique | sensibilità al singolo fotone | sensibilidad de fotón único | PROPOSED |
| pixel | Pixel | pixel | pixel | píxel | PROPOSED |
| pixel pitch | Pixelraster | pas de pixels | passo dei pixel | paso de píxel | PROPOSED — DE reviewer to choose between "Pixelraster" and "Pixelabstand". |
| fill factor | Füllfaktor | facteur de remplissage | fattore di riempimento | factor de llenado | PROPOSED |
| dynamic range | Dynamikumfang | plage dynamique | gamma dinamica | rango dinámico | PROPOSED |
| contrast resolution | Kontrastauflösung | résolution en contraste | risoluzione di contrasto | resolución de contraste | PROPOSED |
| spatial resolution | Ortsauflösung | résolution spatiale | risoluzione spaziale | resolución espacial | PROPOSED |
| image quality | Bildqualität | qualité d'image | qualità dell'immagine | calidad de imagen | PROPOSED |
| sharpness | Schärfe | netteté | nitidezza | nitidez | PROPOSED |
| blur | Unschärfe | flou | sfocatura | desenfoque | PROPOSED |
| signal loss | Signalverlust | perte de signal | perdita di segnale | pérdida de señal | PROPOSED |
| low-dose performance | Niedrigdosis-Performance *(reviewer to confirm; alt. "Leistung bei niedriger Dosis")* | performance à faible dose | prestazioni a bassa dose | desempeño con dosis baja | PROPOSED |
| dose | Dosis | dose | dose | dosis | PROPOSED |
| acquisition (image) | Bildaufnahme | acquisition (d'image) | acquisizione (immagine) | adquisición (de imagen) | PROPOSED |

## 4. Materials, semiconductors, acronyms — KEEP-EN

These are international scientific notations / acronyms. Translating them is
incorrect even where a local equivalent technically exists.

| English | All locales | Notes |
|---|---|---|
| CdTe | CdTe | Chemical symbol for cadmium telluride. Never expand inline. |
| Si | Si | Chemical symbol for silicon. |
| CMOS | CMOS | International acronym. |
| CdTe-CMOS | CdTe-CMOS | Hybrid designation. |
| Si-CMOS | Si-CMOS | Hybrid designation. |
| DQE | DQE | Detective Quantum Efficiency. Standard acronym in medical imaging globally — do not localise. If the source spells it out, see per-locale expansions below. |
| TDI | TDI | Time Delay Integration. Standard acronym. |
| MTF | MTF | Modulation Transfer Function. If introduced. |
| ADC | ADC | Analog-to-Digital Converter. If introduced. |
| Gigabit Ethernet | Gigabit Ethernet | Standard term. |

**Per-locale expansion when source spells out "Detective Quantum Efficiency":**

| Locale | Expansion |
|---|---|
| DE | Detective Quantum Efficiency (DQE) *(PROPOSED — keep English term; technical literature in DE uses the English term)* |
| FR | efficacité quantique de détection (DQE) *(PROPOSED)* |
| IT | efficienza quantica di rivelazione (DQE) *(PROPOSED)* |
| ES | eficiencia cuántica de detección (DQE) *(PROPOSED)* |

## 5. Application domains and modalities

| English | DE | FR | IT | ES | Status |
|---|---|---|---|---|---|
| dental | dental / Dental- *(compound prefix)* | dentaire | dentale | dental | PROPOSED |
| medical | medizinisch / Medizin- *(compound prefix)* | médical | medicale / medico | médico | PROPOSED |
| industrial | industriell / Industrie- *(compound prefix)* | industriel | industriale | industrial | PROPOSED |
| intraoral | intraoral | intra-oral | intraorale | intraoral | PROPOSED — IT reviewer to confirm vs. "endorale". |
| extraoral | extraoral | extra-oral | extraorale | extraoral | PROPOSED |
| panoramic (imaging) | Panoramaröntgen *(noun)* / Panorama- *(prefix)* | panoramique | panoramico | panorámico | PROPOSED |
| cephalometric | kephalometrisch *(adjective)* / Kephalometrie *(noun)* | céphalométrique | cefalometrico | cefalométrico | PROPOSED |
| CBCT (Cone Beam CT) | DVT *(Digitale Volumentomografie — German clinical convention)* / CBCT | CBCT | CBCT | CBCT | PROPOSED — DE reviewer must decide whether DACH dental audience uses "DVT" or "CBCT" more in marketing copy. |
| inline inspection | Inline-Inspektion | inspection en ligne | ispezione in linea | inspección en línea | PROPOSED |
| non-destructive testing (NDT) | zerstörungsfreie Prüfung (ZfP) | contrôle non destructif (CND) | controllo non distruttivo (CND) | ensayos no destructivos (END) | PROPOSED |

## 6. Manufacturing and process terms

| English | DE | FR | IT | ES | Status |
|---|---|---|---|---|---|
| cleanroom | Reinraum | salle blanche | camera bianca | sala limpia | PROPOSED |
| wafer | Wafer | wafer | wafer | oblea / wafer | PROPOSED — ES reviewer to confirm common industry usage. |
| die / chip | Chip | puce | chip | chip | PROPOSED |
| flip chip | Flip-Chip | flip chip | flip chip | flip chip | KEEP-EN-LIKE — technical term, English form retained across locales. |
| flip chip bonding | Flip-Chip-Bonden | assemblage par flip chip | bonding flip chip | unión flip chip | PROPOSED |
| wire bonding | Drahtbonden | câblage filaire | wire bonding | unión por hilo | PROPOSED |
| bumping (CMOS bumping) | Bumping | bumping | bumping | bumping | KEEP-EN — process term, English form used internationally. |
| die assembly | Die-Assembly *(reviewer to confirm)* | assemblage de puces | assemblaggio dei die | montaje de chips | PROPOSED |
| characterization | Charakterisierung | caractérisation | caratterizzazione | caracterización | PROPOSED |
| contract manufacturing | Auftragsfertigung | fabrication sous contrat | produzione conto terzi | fabricación por contrato | PROPOSED |
| readout (CMOS readout) | Auslese (CMOS-Auslese) | lecture (lecture CMOS) | lettura (lettura CMOS) | lectura (lectura CMOS) | PROPOSED |
| readout electronics | Ausleseelektronik | électronique de lecture | elettronica di lettura | electrónica de lectura | PROPOSED |

## 7. Product modes and connectivity

| English | DE | FR | IT | ES | Status |
|---|---|---|---|---|---|
| wireless | kabellos *(general consumer register)* / wireless *(technical register)* | sans fil | wireless / senza fili | inalámbrico | PROPOSED — DE reviewer to choose register per page. |
| corded / wired | kabelgebunden | filaire | cablato / con cavo | con cable / por cable | PROPOSED |
| frame mode | Frame Mode | mode trame | modalità frame | modo de fotogramas | PROPOSED — DE/FR/IT/ES reviewers to confirm whether industry literature uses English or localised form. |
| TDI mode | TDI-Modus | mode TDI | modalità TDI | modo TDI | PROPOSED |
| active area | aktive Fläche | surface active | area attiva | área activa | PROPOSED |
| active width | aktive Breite | largeur active | larghezza attiva | anchura activa | PROPOSED |

## 8. UI / navigation strings (anchor translations)

These are not technical terms but they appear on every page, so consistency
matters. Layout depth must be re-checked when these change (see Phase 3
layout hardening) — German nav strings in particular widen the navigation bar.

| English | DE | FR | IT | ES | Status |
|---|---|---|---|---|---|
| Home | Start | Accueil | Home | Inicio | PROPOSED — DE: "Start" preferred over "Startseite" for nav compactness. |
| Products | Produkte | Produits | Prodotti | Productos | PROPOSED |
| Applications | Anwendungen | Applications | Applicazioni | Aplicaciones | PROPOSED |
| About | Über uns | À propos | Chi siamo | Nosotros | PROPOSED |
| Contact | Kontakt | Contact | Contatti | Contacto | PROPOSED |
| Explore Products | Produkte ansehen *(shorter than "entdecken"; needed for button width)* | Voir les produits | Scopri i prodotti | Ver productos | PROPOSED — DE reviewer to confirm; English-equivalent "entdecken" overflows the pill button. |
| About Athlos | Über Athlos | À propos d'Athlos | Chi è Athlos | Sobre Athlos | PROPOSED |
| Learn more | Mehr erfahren | En savoir plus | Scopri di più | Más información | PROPOSED |
| Download | Download / Herunterladen | Télécharger | Scarica | Descargar | PROPOSED |
| Manufacturing Services | Fertigungsdienstleistungen | Services de fabrication | Servizi di produzione | Servicios de fabricación | PROPOSED |
| Software Products | Software-Produkte | Produits logiciels | Prodotti software | Productos de software | PROPOSED |

## 9. Cookie / consent / legal boilerplate

These strings carry legal implications. **Do not AI-translate without
locale-specific legal review.** The translations below are placeholders until
a vetted localised template is sourced for each jurisdiction.

| English | DE | FR | IT | ES | Status |
|---|---|---|---|---|---|
| Cookie banner accept | Akzeptieren | Accepter | Accetta | Aceptar | PROPOSED |
| Cookie banner reject | Ablehnen | Refuser | Rifiuta | Rechazar | PROPOSED |
| Privacy Policy | Datenschutzerklärung | Politique de confidentialité | Informativa sulla privacy | Política de privacidad | PROPOSED |
| Terms | AGB | Conditions générales | Termini | Términos | PROPOSED — only if introduced. |
| Imprint / Legal notice | Impressum | Mentions légales | Note legali | Aviso legal | PROPOSED — note: DE has a legal requirement for an Impressum page if the site targets German users. Flag this for the German launch. |

**Mandatory action before DE launch:** decide whether `athlos.fi/de/` requires
a German Impressum under TMG §5 / DDG. If yes, this is a new page, not just a
translation. Discuss with legal before Phase 4.

## 10. Style and register rules per locale

Rules that apply to every string, not just the terms above.

### DE (German)

- **Formal address (Sie / Ihr)** throughout. Athlos's audience is B2B
  (engineers, procurement, distributors). Never use "Du".
- **Compound nouns**: prefer the compact German compound form ("Röntgensensor",
  not "Sensor für Röntgenstrahlung") when it fits the layout.
- **Anglicisms**: accept established industry anglicisms (CMOS, TDI, Wireless,
  Pixel) without forcing a German equivalent. Reviewer judgement applies.
- **Quotation marks**: use „German style" („…") in body copy.
- **Numerals**: decimal comma (3,2 mm not 3.2 mm). Thousands separator is a
  period or thin space.

### FR (French)

- **Formal address (vous)** throughout.
- **Non-breaking space** before `:`, `;`, `!`, `?`, `»` and inside `« … »`
  quotation marks — French typographic rule. Translator must use `&nbsp;` or
  the actual NBSP character; this is not optional.
- **Numerals**: decimal comma; thousands separator is a thin space.
- **English technical terms**: prefer the French equivalent when one is
  established (e.g. "matériel" not "hardware") but keep the English form for
  internationally standardised terms (CMOS, TDI, wireless when used in
  product-spec context).

### IT (Italian)

- **Formal address (Lei / voi)** throughout. "Lei" for individual readers,
  "voi" when addressing a company/team as a group. Reviewer chooses per page.
- **Numerals**: decimal comma.
- **English anglicisms** are commonly retained in IT technical copy (wireless,
  software, hardware, scanning). Default to retention unless the Italian
  equivalent is more natural in context.

### ES (Spanish)

- **Formal address (usted)** throughout. Do not use the informal "tú".
- **Regional variant**: target **Spain (es-ES)** in the first launch, not
  Latin American Spanish. This affects vocabulary ("ordenador" vs
  "computadora"), verb forms (vosotros vs ustedes), and date formats. If a
  Latin American market becomes commercially important later, plan a
  separate `es-419` or `es-MX` locale rather than mixing variants.
- **Numerals**: decimal comma in es-ES.
- **Inverted punctuation**: ¿ and ¡ are mandatory in Spanish questions and
  exclamations.

## 11. Things that are NEVER translated

In addition to the KEEP-EN tables above:

- Email addresses, URLs, file names.
- Code samples, command-line snippets (none currently on site, but listed for
  future-proofing).
- The text inside `<code>` or `<pre>` blocks.
- Schema.org `@type` values and JSON-LD property keys (only the string values
  are translated; the keys stay English).
- HTML attribute values like `alt` text **are** translated; HTML attribute
  names are not.
- Country names that appear as part of a legal address ("Espoo, Finland" /
  "Klovinpellontie 1-3") — addresses stay in the original form.
- Patent numbers, ISO standard numbers, FDA clearance numbers.

## 12. Change log

Every edit to this file should append an entry below. Translators consult the
log when re-syncing locale files after a glossary change.

| Date | Author | Change |
|---|---|---|
| 2026-05-18 | initial draft | First version. All DE/FR/IT/ES entries marked PROPOSED pending native technical reviewer pass per locale. |

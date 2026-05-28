# German (de-DE) style and terminology decisions

This is the **binding** style guide for the German translation in
i18n/de.json + i18n/parts-de/*.json. Decisions below resolve the
`PROPOSED — DE reviewer to confirm` entries in i18n/glossary.md.

**Status:** First-draft decisions made for Phase 4 launch. All entries
still require a native German technical reviewer pass before any
public German launch. Until then, every DE string remains PROPOSED.

---

## Address and register

| Rule | Decision |
|---|---|
| Address form | **Sie / Ihr** throughout. Never "Du". B2B audience. |
| Tone | Premium but restrained. Avoid marketing fluff and exclamation marks. |
| Sentence length | Prefer short, clear German over heavy compound clauses. If an English sentence has two ideas, split it into two German sentences rather than chaining them with relative clauses. |

## "Direct conversion" — the core brand concept

| English form | German form | Notes |
|---|---|---|
| direct conversion *(lowercase, prose noun phrase)* | **Direktkonversion** | One word. Use as a compound base for derived terms. |
| Direct Conversion *(title-case, branded marketing phrase)* | **Direktkonversion** (or **Direkte Konversion** in headlines) | Keep capitalised when English source treats it as a brand. |
| direct conversion sensor | **Direktkonversionssensor** | Compound. |
| direct conversion imaging | **Direktkonversions-Bildgebung** | Hyphenated for readability. |
| direct conversion technology | **Direktkonversions-Technologie** | Hyphenated. |
| direct conversion CdTe-CMOS hybrids | **CdTe-CMOS-Hybride mit Direktkonversion** | Use prepositional form when English has multiple adjectives. |
| indirect conversion | **indirekte Konversion** | Two words; only used in contrast pieces. |

Why "Direktkonversion" not "Direkte Konversion" everywhere: the compact
compound form is the dominant convention in German detector-physics
literature (cf. Fraunhofer, PTB publications). Two-word "Direkte
Konversion" reads as adjective+noun, which feels descriptive rather
than referring to a named technology.

## X-ray family

| English | German |
|---|---|
| X-ray *(physical phenomenon, standalone noun)* | **Röntgenstrahlung** |
| X-ray *(adjective / compound prefix)* | **Röntgen-** (e.g. Röntgenbild, Röntgensensor) |
| X-ray imaging | **Röntgenbildgebung** |
| X-ray sensor | **Röntgensensor** |
| X-ray photon | **Röntgenphoton** |
| X-ray photons (pl.) | **Röntgenphotonen** |
| X-ray detector | **Röntgendetektor** |
| X-ray system | **Röntgensystem** |

## Technical detail terms

| English | German | Notes |
|---|---|---|
| scintillator | **Szintillator** | |
| photodiode | **Photodiode** | |
| pixel pitch | **Pixelraster** | Picked over "Pixelabstand". |
| fill factor | **Füllfaktor** | |
| dynamic range | **Dynamikumfang** | |
| signal loss | **Signalverlust** | |
| blur | **Unschärfe** | |
| sharpness | **Schärfe** | |
| contrast resolution | **Kontrastauflösung** | |
| spatial resolution | **Ortsauflösung** | |
| image quality | **Bildqualität** | |
| photon counting | **Photonenzählung** | |
| single-photon sensitivity | **Einzelphotonen-Empfindlichkeit** | |
| dose | **Dosis** | |
| low-dose performance | **Leistung bei niedriger Dosis** | More natural than "Niedrigdosis-Performance". |
| frame rate | **Bildrate** | |
| line rate | **Zeilenrate** | TDI context. |
| readout | **Auslese** | |
| readout electronics | **Ausleseelektronik** | |
| reconstruction | **Rekonstruktion** | |
| reconstruction algorithm | **Rekonstruktionsalgorithmus** | |
| post-processing | **Nachbearbeitung** | |
| filter (image processing) | **Filter** | KEEP-EN form, masculine: "der Filter". |
| acquisition | **Aufnahme** *(noun)* / **Erfassung** *(more technical)* | Use "Aufnahme" for the act of capturing an image; "Erfassung" for data acquisition broadly. |

## Application domains

| English | German |
|---|---|
| dental imaging | **Dentale Bildgebung** *(noun)* / **dental-** *(prefix)* |
| medical imaging | **medizinische Bildgebung** |
| industrial imaging | **industrielle Bildgebung** |
| intraoral | **intraoral** |
| extraoral | **extraoral** |
| panoramic imaging | **Panoramaröntgen** *(noun)* / **Panorama-** *(prefix)* |
| cephalometric imaging | **Fernröntgenseitenbild (FRS)** *(noun, clinical convention in DACH dentistry)* / **kephalometrisch** *(adjective when describing measurement)* |
| CBCT / Cone Beam CT | **DVT (Digitale Volumentomografie)** | German dental convention. On first use spell out; subsequent uses "DVT". When the audience is more international/industrial, retain "CBCT". |
| inline inspection | **Inline-Inspektion** |
| non-destructive testing / NDT | **zerstörungsfreie Prüfung (ZfP)** |

## Materials / acronyms — KEEP-EN

CdTe, Si, CMOS, CdTe-CMOS, Si-CMOS, DQE, TDI, MTF, ADC, IP67,
ISO 13485:2016, FDA, FDA 510(k), CE, TWAIN, SDK, Bluetooth, GigE,
Gigabit Ethernet — all stay in English form, no translation.

## Product / brand names — KEEP-EN

Athlos, Athlos Oy, DC-Air®, WIOS, UFS, UFS150, UFS225, UFS460,
Industrial IP67 TDI, Ultra-Fast Scanning Sensor, True Wireless®,
Zero Profile®, Simage Oy, Ajat Oy, Oy Direct Conversion Ltd.,
Varex Imaging Finland Ltd., VTT Micronova, Cefla, Konstantinos
Spartiotis — all stay in English form. The ® symbols are preserved.

## Regulatory wording

| English | German |
|---|---|
| FDA-cleared | **FDA-zugelassen** *(common in DE medical-device industry)* |
| FDA 510(k) cleared | **FDA-510(k)-zugelassen** |
| ISO 13485:2016 certified | **nach ISO 13485:2016 zertifiziert** |
| ISO 13485:2016 Certified *(short footer label)* | **ISO 13485:2016 zertifiziert** |

**Conservatism rule:** if the English source says "cleared" /
"certified" / "approved", the German MUST NOT escalate the claim
(e.g. don't translate "cleared" as "freigegeben" if "zugelassen"
already covers it; don't introduce new approvals not in the source).

## UI / chrome

| English | German | Notes |
|---|---|---|
| Home | **Start** | Shorter than "Startseite"; fits nav. |
| Products | **Produkte** | |
| Applications | **Anwendungen** | |
| About | **Über uns** | |
| About Athlos | **Über Athlos** | |
| Contact | **Kontakt** | |
| Explore Products | **Produkte ansehen** | Shorter than "entdecken"; fits pill button. |
| Learn more | **Mehr erfahren** | |
| Discuss application | **Anwendung besprechen** | |
| Technical specs | **Technische Daten** | |
| Send Message | **Nachricht senden** | |
| Download | **Download** | English form retained — established term. |
| Manufacturing Services | **Fertigungsdienstleistungen** | |
| Software Products | **Software-Produkte** | |
| Privacy Policy | **Datenschutzerklärung** | |
| All rights reserved. | **Alle Rechte vorbehalten.** | |
| Made in Finland. | **Hergestellt in Finnland.** | |
| ISO 13485:2016 Certified | **ISO 13485:2016 zertifiziert** | |
| Business ID | **Geschäfts-ID** | Or "Handelsregister-Nr." — chose "Geschäfts-ID" for compactness; reviewer may prefer the latter. |
| VAT | **USt-IdNr.** | Standard German VAT identifier label. |
| Last updated: | **Zuletzt aktualisiert:** | |
| ← Products | **← Produkte** | |
| Footer navigation | **Fußzeilen-Navigation** | aria-label. |
| Main navigation | **Hauptnavigation** | aria-label. |
| Open menu | **Menü öffnen** | aria-label. |
| Athlos home | **Athlos Startseite** | aria-label on logo link. |
| Products navigation | **Produkt-Navigation** | product subnav aria-label. |

## Modes / connectivity

| English | German |
|---|---|
| wireless *(branded / DC-Air® context)* | **Wireless** (KEEP-EN — part of "True Wireless®") |
| wireless *(general technical adjective)* | **kabellos** |
| corded / wired | **kabelgebunden** |
| frame mode | **Frame-Modus** |
| TDI mode | **TDI-Modus** |
| active area | **aktive Fläche** |
| active width | **aktive Breite** |
| line rate up to N lines per second | **Zeilenrate bis zu N Zeilen pro Sekunde** |

## Numerals and typography

- Decimal comma: **3,2 mm** (not 3.2 mm).
- Thousands separator: period or thin space: 75 000 lps or 75.000 lps. Pick period for consistency in this site.
- Units: keep a regular space between number and unit: "30 m/min", "9 MeV", "16 Bit" (Bit capitalised in DE typography).
- Quotation marks: **„German style"** in body copy. Do not use straight quotes "…".
- Em-dash: **—** (the same character as English).
- Dash for "from–to" ranges: en-dash "10–40 °C".

## Compound noun style

German prefers compact compounds where possible:

- ✅ **Röntgensensor** (not "Sensor für Röntgenstrahlung")
- ✅ **Reinraumfertigung** (not "Fertigung im Reinraum") — when adjectivally tight
- ❌ **Verbundwortmonster** — avoid creating 5+ noun stacks. Split with hyphens or prepositional phrases when the compound gets unreadable.

When a hyphen helps readability, use it: **Direktkonversions-Bildgebung**, **CdTe-CMOS-Hybride**.

## Things to be conservative about

- **Regulatory claims**: never strengthen. "cleared" → "zugelassen", not "freigegeben" or "geprüft" (which imply different / stronger things).
- **Performance figures**: keep all numerical values exactly as English. Do not round, do not convert units.
- **Patent / patent-pending language**: do not invent. If English source doesn't claim "patented", German doesn't either.
- **Founder/team history**: keep all dates, company names, university names verbatim. Konstantinos Spartiotis is "Konstantinos Spartiotis" — no transliteration.

## Pending decisions to flag for reviewer

These were judgement calls; reviewer should confirm or override:

1. **Direktkonversion vs Direkte Konversion**: chose Direktkonversion. Native reviewer may prefer the two-word form in marketing headlines.
2. **DVT vs CBCT**: chose DVT for dental clinical convention. If the German B2B audience is more international (e.g. equipment OEMs), CBCT may be more recognisable.
3. **Business ID label**: chose "Geschäfts-ID". Native preference may be "Handelsregister-Nr." or just "HRB-Nr." — depends on the legal entity type Athlos Oy maps to in German understanding (and Athlos is Finnish, not German, so the analogy is imprecise either way).
4. **Cephalometric**: defaulted to "Fernröntgenseitenbild (FRS)" for noun usage in dental copy. If the audience is more medical-imaging-broad, "kephalometrische Aufnahme" may read better.
5. **About → "Über uns"** vs **"Athlos" / "Über Athlos"**: chose "Über uns" for nav; "Über Athlos" for the longer "About Athlos" CTA. Reviewer may prefer one or the other consistently.

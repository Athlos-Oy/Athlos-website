# Italian (it-IT) style and terminology decisions

Binding style guide for the Italian translation in `i18n/it.json` +
`i18n/parts-it/*.json`. Resolves the `PROPOSED — IT reviewer to confirm`
entries in `i18n/glossary.md`. Mirrors the structure of
`i18n/de-style-decisions.md`.

**Status:** First-draft decisions made for the Italian launch. All
entries remain PROPOSED until a native Italian technical reviewer
signs off.

---

## Address and register

| Rule | Decision |
|---|---|
| Address form | **Lei** (formal singular) throughout. Athlos's audience is B2B (engineers, procurement, dental/medical OEMs, distributors). Do not use "tu". When addressing a company collectively, the glossary allowed "voi" — but in B2B web copy "Lei" reads cleaner; default to Lei everywhere unless a passage clearly addresses a whole team. |
| Tone | Premium, restrained, technically credible. Avoid exclamation marks. Avoid marketing fluff phrases ("rivoluzionario", "all'avanguardia") unless the source explicitly uses them. |
| Sentence length | Italian tolerates longer relative clauses, but short clear sentences read more credibly in B2B technical copy. Prefer short. |

## "Direct conversion" — the core brand concept

Italian doesn't form German-style noun compounds, so the prepositional
form is the standard idiom:

| English | Italian | Notes |
|---|---|---|
| direct conversion *(lowercase prose)* | **conversione diretta** | Two words. |
| Direct Conversion *(title-case branded phrase)* | **Conversione Diretta** | Capitalised when source treats it as a brand. |
| direct conversion sensor | **sensore a conversione diretta** | Prepositional. |
| direct conversion imaging | **imaging a conversione diretta** | "Imaging" kept English — established term in Italian medical/industrial copy. Alternative "radiografia" only fits dental contexts. |
| direct conversion technology | **tecnologia a conversione diretta** | |
| direct conversion CdTe-CMOS hybrids | **ibridi CdTe-CMOS a conversione diretta** | |
| indirect conversion | **conversione indiretta** | Only appears in contrast paragraphs. |

## X-ray family

Italian uses both "raggi X" (rays) and "radiografia" (the discipline /
the image). Pick by context:

| English | Italian |
|---|---|
| X-ray *(physical phenomenon)* | **raggi X** |
| X-ray imaging *(general)* | **imaging a raggi X** |
| X-ray imaging *(dental/medical clinical)* | **radiografia** (acceptable substitute when context is clinical) |
| X-ray sensor | **sensore a raggi X** |
| X-ray photon | **fotone X** |
| X-ray photons (pl.) | **fotoni X** |
| X-ray detector | **rivelatore a raggi X** |
| X-ray system | **sistema a raggi X** |

## Technical detail terms

| English | Italian | Notes |
|---|---|---|
| scintillator | **scintillatore** | |
| photodiode | **fotodiodo** | |
| pixel pitch | **passo dei pixel** | |
| fill factor | **fattore di riempimento** | |
| dynamic range | **gamma dinamica** | |
| signal loss | **perdita di segnale** | |
| blur | **sfocatura** | |
| sharpness | **nitidezza** | |
| contrast resolution | **risoluzione di contrasto** | |
| spatial resolution | **risoluzione spaziale** | |
| image quality | **qualità dell'immagine** | |
| photon counting | **conteggio dei fotoni** | |
| single-photon sensitivity | **sensibilità al singolo fotone** | |
| dose | **dose** | |
| low-dose performance | **prestazioni a bassa dose** | |
| frame rate | **frame rate** | KEEP-EN — standard in IT industry copy. |
| line rate | **velocità di linea** | TDI context. |
| readout | **lettura** | |
| readout electronics | **elettronica di lettura** | |
| reconstruction | **ricostruzione** | |
| reconstruction algorithm | **algoritmo di ricostruzione** | |
| post-processing | **post-elaborazione** | |
| filter (image processing) | **filtro** | masculine: "il filtro" |
| acquisition | **acquisizione** | |

## Application domains

| English | Italian |
|---|---|
| dental imaging | **imaging dentale** / **radiografia dentale** *(clinical)* |
| medical imaging | **imaging medicale** |
| industrial imaging | **imaging industriale** |
| intraoral | **intraorale** | Defaulted over "endorale" — more international, fits OEM register. |
| extraoral | **extraorale** |
| panoramic imaging | **radiografia panoramica** *(noun)* / **panoramico** *(adjective)* |
| cephalometric imaging | **cefalometria** *(noun)* / **cefalometrico** *(adjective)* |
| CBCT / Cone Beam CT | **CBCT** (KEEP-EN) | Italian dental practice uses CBCT as-is. |
| inline inspection | **ispezione in linea** |
| non-destructive testing / NDT | **controllo non distruttivo (CND)** |

## Materials / acronyms — KEEP-EN

CdTe, Si, CMOS, CdTe-CMOS, Si-CMOS, DQE, TDI, MTF, ADC, IP67,
ISO 13485:2016, FDA, FDA 510(k), CE, TWAIN, SDK, Bluetooth, GigE,
Gigabit Ethernet, ASIC — all stay in English.

## Product / brand names — KEEP-EN

Athlos, Athlos Oy, DC-Air®, WIOS, UFS, UFS150, UFS225, UFS460,
Industrial IP67 TDI, Ultra-Fast Scanning Sensor, True Wireless®,
Zero Profile®, Simage Oy, Ajat Oy, Oy Direct Conversion Ltd.,
Varex Imaging Finland Ltd., VTT Micronova, Cefla, Konstantinos
Spartiotis — verbatim, ® symbols preserved.

## Regulatory wording

| English | Italian |
|---|---|
| FDA-cleared | **autorizzato dalla FDA** |
| FDA 510(k) cleared | **autorizzato dalla FDA tramite procedura 510(k)** *(full form)* / **autorizzato FDA 510(k)** *(short form for compact labels)* |
| ISO 13485:2016 certified | **certificato secondo la norma ISO 13485:2016** *(full form)* / **certificato ISO 13485:2016** *(short label)* |

**Conservatism rule:** if English says "cleared" / "certified", Italian
must NOT escalate. Do not translate "cleared" as "approvato" if
"autorizzato" already covers it (the two are not legally identical).

## UI / chrome

| English | Italian | Notes |
|---|---|---|
| Home | **Home** | KEEP-EN — common on Italian sites; shorter than "Inizio" for nav. |
| Products | **Prodotti** | |
| Applications | **Applicazioni** | |
| About | **Chi siamo** | |
| About Athlos | **Chi è Athlos** | |
| Contact | **Contatti** | |
| Explore Products | **Scopri i prodotti** | |
| Learn more | **Scopri di più** | |
| Discuss application | **Discuti l'applicazione** | |
| Technical specs | **Specifiche tecniche** | |
| Send Message | **Invia messaggio** | |
| Download | **Scarica** | |
| Manufacturing Services | **Servizi di produzione** | |
| Software Products | **Prodotti software** | |
| Privacy Policy | **Informativa sulla privacy** | |
| All rights reserved. | **Tutti i diritti riservati.** | |
| Made in Finland. | **Prodotto in Finlandia.** | |
| ISO 13485:2016 Certified | **Certificato ISO 13485:2016** | |
| Business ID | **ID Aziendale** | Athlos is a Finnish company; Italian commercial register codes differ structurally so a generic label is safest. |
| VAT | **P. IVA** | Standard Italian abbreviation for Partita IVA. |
| Last updated: | **Ultimo aggiornamento:** | |
| ← Products | **← Prodotti** | |
| Footer navigation | **Navigazione del footer** | aria-label. |
| Main navigation | **Navigazione principale** | aria-label. |
| Open menu | **Apri menu** | aria-label. |
| Athlos home | **Home Athlos** | aria-label on logo link. |
| Products navigation | **Navigazione prodotti** | product subnav aria-label. |

## Modes / connectivity

| English | Italian |
|---|---|
| wireless *(branded — True Wireless®)* | **Wireless** (KEEP-EN — part of trademark) |
| wireless *(technical adjective)* | **wireless** (lowercase, KEEP-EN) — standard in IT industry copy |
| corded / wired | **cablato** |
| frame mode | **modalità frame** |
| TDI mode | **modalità TDI** |
| active area | **area attiva** |
| active width | **larghezza attiva** |
| line rate up to N lines per second | **velocità di linea fino a N righe al secondo** |

## Numerals and typography

- Decimal comma: **3,2 mm** (not 3.2 mm).
- Thousands separator: period: **75.000 lps**.
- Units: regular space between number and unit: "30 m/min", "9 MeV", "16 bit".
- Quotation marks: italian standard is **« ... »** or **"..."**. For
  JSON simplicity and consistency with English source markup, use
  straight `"..."` in body copy unless a quotation pair appears, in
  which case prefer **« ... »** (Italian guillemets).
- Em-dash: **—** (the same character as English).
- En-dash for ranges: **10–40 °C**.
- Apostrophe in elisions: standard `'` (not curly): **dell'immagine**.

## Compound noun / phrase style

Italian uses prepositional phrases where German uses compounds and English
uses noun stacking:

- ✅ **sensore a raggi X** (not "raggi-X-sensore")
- ✅ **fertigung in camera bianca** — wait, Italian: **produzione in camera bianca**
- ✅ **ibridi a conversione diretta** (not "conversione-diretta-ibridi")

Avoid stacking three or more nouns without prepositions.

## Things to be conservative about

- **Regulatory claims**: never strengthen. "cleared" → "autorizzato", not "approvato" or "validato".
- **Performance figures**: keep all numerical values exactly as English. Do not round, do not convert units.
- **Patent / patent-pending language**: do not invent. If English source doesn't claim "patented", Italian doesn't either.
- **Founder/team history**: keep all dates, company names, university names verbatim. "Konstantinos Spartiotis" — no transliteration.

## Pending decisions to flag for reviewer

1. **"Home" vs "Inizio"** — chose "Home" for nav compactness. Native reviewer may prefer "Inizio".
2. **"intraorale" vs "endorale"** — defaulted to intraorale. Italian dental practice in some regions uses "endorale". Reviewer's call.
3. **"cefalometria" vs "telecranio LL"** — chose cefalometria. Some Italian dental literature uses "telecranio in proiezione latero-laterale" or just "telecranio LL". Reviewer to confirm if telecranio is more natural.
4. **"Business ID label"** — chose "ID Aziendale". Native preference may be "Codice aziendale" or just "Codice".
5. **"Prodotto in Finlandia" vs "Fabbricato in Finlandia"** — chose Prodotto. Slightly softer than Fabbricato. Reviewer may prefer the latter for industrial brand register.
6. **"Lei" everywhere vs "voi" for collective addressing** — picked Lei. Reviewer may want to switch to voi on pages that explicitly address a company/team.

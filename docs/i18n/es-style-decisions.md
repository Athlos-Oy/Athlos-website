# Spanish (es-ES) style and terminology decisions

Binding style guide for the Spanish translation in `i18n/es.json` +
`i18n/parts-es/*.json`. Resolves the `PROPOSED — ES reviewer to confirm`
entries in `i18n/glossary.md`. Mirrors the structure of
`i18n/de-style-decisions.md` and `i18n/it-style-decisions.md`.

**Status:** First-draft decisions made for the Spanish launch. All
entries remain PROPOSED until a native Spanish technical reviewer
signs off.

**Target locale:** es-ES (Spain). Latin American Spanish (es-419 /
es-MX) is explicitly out of scope for the first launch — if the
commercial case becomes important later, plan a separate locale rather
than mixing variants.

---

## Address and register

| Rule | Decision |
|---|---|
| Address form | **Usted** (formal singular) throughout. Athlos's audience is B2B (engineers, procurement, dental/medical OEMs, distributors). Never use "tú". Plural collective address uses "ustedes", not "vosotros". |
| Tone | Premium, restrained, technically credible. Avoid exclamation marks. Avoid marketing fluff phrases ("revolucionario", "vanguardista") unless the source explicitly uses them. |
| Sentence length | Spanish naturally builds longer sentences with subordinate clauses; resist the temptation. Prefer short, clear sentences for B2B technical credibility — they also help button and card layouts hold their shape. |
| Inverted punctuation | `¿…?` and `¡…!` are mandatory and used wherever the source has a question or exclamation. |

## "Direct conversion" — the core brand concept

Spanish uses prepositional phrases ("de", "por") instead of compound
nouns. The standard idiom is consistent across medical and industrial
imaging copy:

| English | Spanish | Notes |
|---|---|---|
| direct conversion *(lowercase prose)* | **conversión directa** | Two words. |
| Direct Conversion *(title-case branded phrase)* | **Conversión Directa** | Capitalised when source treats it as a brand name. |
| direct conversion sensor | **sensor de conversión directa** | "de" + noun, not "a conversión directa". |
| direct conversion imaging | **imagen por conversión directa** | "imagen por" is the standard Spanish form for "X imaging". |
| direct conversion technology | **tecnología de conversión directa** | |
| direct conversion CdTe-CMOS hybrids | **híbridos CdTe-CMOS de conversión directa** | |
| indirect conversion | **conversión indirecta** | Only used in contrast paragraphs. |

## X-ray family

Spanish standard for the discipline is "imagen por rayos X" (the
established equivalent of "X-ray imaging"). "Radiografía" is used for
the specific clinical image artefact:

| English | Spanish |
|---|---|
| X-ray *(physical phenomenon)* | **rayos X** |
| X-ray imaging *(general)* | **imagen por rayos X** |
| X-ray *(individual clinical image, dental context)* | **radiografía** (acceptable substitute when the source describes one specific image) |
| X-ray sensor | **sensor de rayos X** |
| X-ray photon | **fotón de rayos X** |
| X-ray photons (pl.) | **fotones de rayos X** |
| X-ray detector | **detector de rayos X** |
| X-ray system | **sistema de rayos X** |

## Technical detail terms

| English | Spanish | Notes |
|---|---|---|
| scintillator | **centellador** | Standard Spanish medical-imaging term. ES glossary entry was "centellador". |
| photodiode | **fotodiodo** | |
| pixel pitch | **paso de píxel** | |
| fill factor | **factor de llenado** | |
| dynamic range | **rango dinámico** | |
| signal loss | **pérdida de señal** | |
| blur | **desenfoque** | |
| sharpness | **nitidez** | |
| contrast resolution | **resolución de contraste** | |
| spatial resolution | **resolución espacial** | |
| image quality | **calidad de imagen** | |
| photon counting | **conteo de fotones** | |
| single-photon sensitivity | **sensibilidad de fotón único** | |
| dose | **dosis** | |
| low-dose performance | **rendimiento con dosis baja** | More natural than literal "desempeño". |
| frame rate | **frame rate** *(retained)* / **velocidad de fotogramas** | KEEP-EN-LIKE preferred in technical product copy. |
| line rate | **velocidad de línea** | TDI context. |
| readout | **lectura** | |
| readout electronics | **electrónica de lectura** | |
| reconstruction | **reconstrucción** | |
| reconstruction algorithm | **algoritmo de reconstrucción** | |
| post-processing | **postprocesado** | One word, no hyphen, common ES technical usage. |
| filter (image processing) | **filtro** | |
| acquisition | **adquisición** | |

## Application domains

| English | Spanish |
|---|---|
| dental imaging | **imagen dental** *(general)* / **radiografía dental** *(specific images)* |
| medical imaging | **imagen médica** |
| industrial imaging | **imagen industrial** |
| intraoral | **intraoral** |
| extraoral | **extraoral** |
| panoramic imaging | **imagen panorámica** *(general)* / **panorámica** *(adjective)* |
| cephalometric imaging | **cefalometría** *(noun)* / **cefalométrica** *(adjective)* |
| CBCT / Cone Beam CT | **CBCT** (KEEP-EN) | Spanish dental practice uses CBCT as-is. |
| inline inspection | **inspección en línea** |
| non-destructive testing / NDT | **ensayos no destructivos (END)** |

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

| English | Spanish |
|---|---|
| FDA-cleared | **autorizado por la FDA** |
| FDA 510(k) cleared | **autorizado por la FDA mediante 510(k)** *(full form)* / **autorizado FDA 510(k)** *(short label form)* |
| ISO 13485:2016 certified | **certificado según la norma ISO 13485:2016** *(full form)* / **certificado ISO 13485:2016** *(short label form)* |

**Conservatism rule:** if English says "cleared" / "certified",
Spanish must NOT escalate. Do not translate "cleared" as "aprobado"
("approved"). "Autorizado" is the established legal-equivalent verb
for FDA clearance language in Spanish regulatory copy.

## UI / chrome

| English | Spanish | Notes |
|---|---|---|
| Home | **Inicio** | Standard Spanish nav label. Same length as Italian "Home" so no layout risk. |
| Products | **Productos** | |
| Applications | **Aplicaciones** | |
| About | **Nosotros** | Shorter than "Acerca de nosotros"; fits nav well. |
| About Athlos | **Sobre Athlos** | The longer CTA / footer form. |
| Contact | **Contacto** | |
| Explore Products | **Ver productos** | Shorter than "Descubrir los productos". |
| Learn more | **Más información** | |
| Discuss application | **Consultar aplicación** | |
| Technical specs | **Especificaciones técnicas** | |
| Send Message | **Enviar mensaje** | |
| Download | **Descargar** | |
| Manufacturing Services | **Servicios de fabricación** | |
| Software Products | **Productos de software** | |
| Privacy Policy | **Política de privacidad** | |
| All rights reserved. | **Todos los derechos reservados.** | |
| Made in Finland. | **Fabricado en Finlandia.** | |
| ISO 13485:2016 Certified | **Certificado ISO 13485:2016** | |
| Business ID | **Código de empresa** | Athlos is Finnish, not Spanish; a Spanish "CIF" would be technically wrong. "Código de empresa" is neutral and accurate. |
| VAT | **NIF** | Spain uses NIF as the standard fiscal-identifier label for VAT-style identifiers. "IVA" is the tax itself, not the identifier label. |
| Last updated: | **Última actualización:** | |
| ← Products | **← Productos** | |
| Footer navigation | **Navegación del pie de página** | aria-label. |
| Main navigation | **Navegación principal** | aria-label. |
| Open menu | **Abrir menú** | aria-label. |
| Athlos home | **Inicio Athlos** | aria-label on logo link. |
| Products navigation | **Navegación de productos** | product subnav aria-label. |

## Modes / connectivity

| English | Spanish |
|---|---|
| wireless *(branded — True Wireless®)* | **Wireless** (KEEP-EN — part of trademark) |
| wireless *(general technical adjective)* | **inalámbrico** |
| corded / wired | **con cable** |
| frame mode | **modo frame** *(KEEP-EN-LIKE)* |
| TDI mode | **modo TDI** |
| active area | **área activa** |
| active width | **anchura activa** |
| line rate up to N lines per second | **velocidad de línea de hasta N líneas por segundo** |

## Numerals and typography

- **Decimal comma**: `3,2 mm` (not 3.2 mm).
- **Thousands separator**: period: `75.000 lps`, `1.920 m/min`.
- **Units**: regular space between number and unit: `30 m/min`, `9 MeV`, `16 bit`. Use the standard form `16 bits` when the source uses "16-bit" as an adjective and Spanish requires the plural.
- **Quotation marks**: Spanish standard `«…»` for emphasised/quoted phrases in body copy. Straight `"…"` retained where the English source uses straight quotes around legal terms or product names (so the JSON-LD and structural strings keep parity with English).
- **Em-dash**: `—` (same character as English) used for parenthetical and emphatic asides.
- **En-dash for ranges**: `10–40 °C`, `10 – 360 kV` (matches English).
- **Inverted punctuation**: `¿…?` / `¡…!` mandatory.
- **Capitalisation**: Spanish does NOT title-case headings the way English does. Sentence-case is the natural form. Exception: proper nouns, branded phrases (Conversión Directa, Image Accuracy), and product names retain their capitalisation.

## Prepositional / phrase style

Spanish uses prepositions where English stacks nouns:

- ✅ **sensor de rayos X** (not "rayos X sensor")
- ✅ **imagen por rayos X** (not "rayos X imagen")
- ✅ **híbridos de conversión directa** (not "conversión directa híbridos")
- ✅ **fabricación en sala limpia** (not "sala limpia fabricación")

Avoid stacking three or more nouns without prepositions.

## Things to be conservative about

- **Regulatory claims**: never strengthen. "cleared" → "autorizado", not "aprobado" or "validado". The latter are legally distinct.
- **Performance figures**: keep all numerical values exactly as English; only swap the decimal separator (`3.2 mm` → `3,2 mm`). Do not round, do not convert units.
- **Patent / patent-pending language**: do not invent. If English source doesn't claim "patented", Spanish doesn't either.
- **Founder/team history**: keep all dates, company names, university names verbatim. "Konstantinos Spartiotis" — no transliteration.
- **English brand names embedded in Spanish prose** (TigerView, Apteryx, Open Dental, etc.) — keep as-is. Software product names are KEEP-EN.

## Pending decisions to flag for reviewer

These were judgement calls; the native Spanish reviewer should confirm or override:

1. **"Inicio" vs "Home"** — chose "Inicio". Some Spanish sites use "Home"; "Inicio" is the more native option and reads better in B2B technical copy.
2. **"Nosotros" (nav) vs "Sobre Athlos" (CTA)** — chose this split following the established DE/IT pattern. Some reviewers may prefer "Acerca de" in the nav.
3. **"Código de empresa" vs "CIF" vs "Identificador fiscal"** — chose "Código de empresa" because Athlos is Finnish, so a Spanish "CIF" label would be technically incorrect. "Código de empresa" reads as a neutral, accurate description.
4. **"NIF" vs "CIF" vs "VAT"** — chose "NIF" as the contemporary single label for both natural-person and legal-entity tax identifiers in Spain. The legacy "CIF" label was abolished for new identifiers in 2008. Reviewer may prefer the explicit "NIF/IVA".
5. **"Fabricado en Finlandia" vs "Hecho en Finlandia"** — chose "Fabricado" for industrial-brand register. "Hecho" reads consumer-grade.
6. **"postprocesado" (one word) vs "post-procesado" / "post procesado"** — chose the unhyphenated single-word form. RAE-compliant and consistent across the file.
7. **"END" vs "PND" for non-destructive testing** — chose "END" (ensayos no destructivos), the most common Spanish abbreviation. Some industrial sectors still use "PND" or English "NDT".
8. **"con dosis baja" vs "a baja dosis" vs "de baja dosis"** — chose "con dosis baja" for the natural sentence flow ("rendimiento con dosis baja"). Some technical literature uses "a baja dosis".
9. **"conteo de fotones" vs "recuento de fotones"** — chose "conteo de fotones" matching the glossary; "recuento" is also accepted in Spanish technical literature.
10. **"área activa" vs "superficie activa"** — chose "área activa", literal and unambiguous.

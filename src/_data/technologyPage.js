// Single source of truth for the Technology page's FAQ, glossary and
// citation data. Consumed by BOTH the visible page template
// (src/technology/direct-conversion.njk) and its JSON-LD partial
// (partials/page-jsonld/technology-jsonld.njk) so the structured data
// can never drift from the on-page text.
//
// Wording rules (approved 2026-07-03): no "zero spread / perfect /
// zero noise / always better" claims; Athlos products are direct
// conversion with charge-integrating (energy-integrating) readout —
// single-photon SENSITIVE but NOT photon-counting. Historical papers
// document lineage only, never current product specs.

const datePublished = "2026-07-03";
const dateModified = "2026-07-03";

const faq = [
  {
    id: "what-is-direct-conversion",
    q: "What is direct conversion X-ray imaging?",
    a: "Direct conversion X-ray imaging is a detector technology in which X-ray photons are absorbed in a semiconductor — such as CdTe or silicon — and converted directly into electrical charge. There is no scintillator and no visible-light stage, which removes the scintillator light-spread stage and helps preserve sharpness, contrast and detail.",
  },
  {
    id: "direct-vs-indirect",
    q: "What is the difference between direct and indirect conversion?",
    a: "Indirect detectors convert X-rays to visible light in a scintillator, then convert that light to charge in a photodiode array. Direct conversion detectors convert X-rays to charge in a single semiconductor step. The shorter, more localized signal path helps preserve spatial accuracy, depending on detector material, geometry and system design.",
  },
  {
    id: "why-light-spread-matters",
    q: "Why does scintillator light spread matter?",
    a: "In an indirect detector, the visible light created in the scintillator can spread laterally before reaching the photodiodes, so a single photon's signal is recorded over a wider footprint than its absorption point. This broadening limits sharpness at high spatial frequencies. Direct conversion removes this specific light-spread stage.",
  },
  {
    id: "zero-blur",
    q: "Does direct conversion mean zero blur?",
    a: "No. Real detectors still have effects such as charge sharing between neighbouring pixels, K-fluorescence, and system-level factors like focal spot size and motion. Direct conversion removes one dominant spread mechanism — the scintillator light stage — which helps preserve sharpness but does not make imaging blur-free.",
  },
  {
    id: "same-as-photon-counting",
    q: "Is direct conversion the same as photon counting?",
    a: "No. Direct conversion describes how X-ray energy becomes electrical charge in the detector material. Photon counting and charge integration describe how the readout electronics process that charge. A direct conversion detector can be designed for either readout mode. Athlos sensors use charge-integrating readout — they are not photon-counting devices.",
  },
  {
    id: "athlos-photon-counting",
    q: "Are Athlos sensors photon-counting?",
    a: "No. Athlos sensors are direct conversion detectors with charge-integrating (energy-integrating) readout. They are single-photon sensitive — the signal from a single X-ray photon is detectable above the noise floor — but they do not count individual photons or measure the energy of each photon separately.",
  },
  {
    id: "what-is-cdte-cmos",
    q: "What is CdTe-CMOS?",
    a: "CdTe-CMOS is a hybrid detector architecture in which a cadmium telluride crystal is bump-bonded, pixel by pixel, to a custom CMOS readout ASIC. CdTe absorbs X-rays efficiently across a wide energy range, making the architecture well suited to scanning applications. Athlos uses it in the UFS and Industrial IP67 TDI.",
  },
  {
    id: "what-is-si-cmos",
    q: "What is Si-CMOS?",
    a: "Si-CMOS is a direct conversion architecture using crystalline silicon as the absorber, integrated with CMOS readout circuitry. Silicon suits compact, high-resolution detectors at intraoral dental energies. Athlos uses Si-CMOS direct conversion in the DC-Air® wireless intraoral sensor.",
  },
  {
    id: "which-products",
    q: "Which Athlos products use direct conversion?",
    a: "All of them. DC-Air® uses Si-CMOS direct conversion; the Ultra-Fast Scanning Sensor and Industrial IP67 TDI use CdTe-CMOS direct conversion. Athlos Manufacturing Services provide the bumping and flip-chip processes that hybrid direct conversion detectors require, and Athlos software is tuned to direct conversion signal characteristics.",
  },
  {
    id: "dental",
    q: "Why is direct conversion useful in dental imaging?",
    a: "Dental imaging needs fine detail at low patient dose in a small sensor. Direct conversion helps preserve sharpness and contrast without a scintillator layer, supporting a compact sensor structure. Independent evaluations of DC-Air® have noted improved clarity and subtle detail compared with conventional CMOS intraoral sensors.",
  },
  {
    id: "industrial",
    q: "Why is direct conversion useful in industrial inspection?",
    a: "Inline inspection combines high conveyor speeds with the need to detect small, low-contrast features such as foreign objects or weld defects. Direct conversion TDI detectors accumulate signal across stages while preserving a localized signal path — supporting contrast sensitivity at line rates up to 75,000 lines per second.",
  },
  {
    id: "what-is-tdi",
    q: "What is TDI scanning?",
    a: "TDI (Time Delay Integration) is a line-scan technique in which detector row readout is synchronized with object motion. Each of the detector's stages measures the same object slice as it passes, and the signals are summed — improving signal-to-noise ratio without slowing the scan. Athlos TDI sensors use 28 stages.",
  },
  {
    id: "simage-ajat-athlos",
    q: "How is Athlos connected to Simage and Ajat?",
    a: "The same founding team, led by Konstantinos Spartiotis, has developed direct conversion X-ray imaging since 1993 — first at Simage Oy, then at Ajat Oy, whose CdTe-CMOS dental sensors were deployed in thousands of units worldwide. Athlos, founded in 2017, continues that lineage with DC-Air®, UFS and the Industrial IP67 TDI.",
  },
];

const glossary = [
  { id: "direct-conversion", term: "Direct conversion", def: "X-ray detection in which photons are absorbed in a semiconductor and converted directly to electrical charge, with no intermediate visible-light stage." },
  { id: "indirect-conversion", term: "Indirect conversion", def: "X-ray detection in which a scintillator first converts X-rays to visible light, which a photodiode array then converts to electrical charge." },
  { id: "scintillator", term: "Scintillator", def: "A material, such as CsI or GOS, that emits visible light when it absorbs X-rays; the intermediate conversion stage in indirect detectors." },
  { id: "cdte", term: "CdTe (cadmium telluride)", def: "A high-Z semiconductor with strong X-ray absorption across a wide energy range, used as the direct conversion material in Athlos scanning sensors." },
  { id: "si-cmos", term: "Si-CMOS", def: "A direct conversion architecture using a crystalline silicon absorber integrated with CMOS readout circuitry; used in the DC-Air® intraoral sensor." },
  { id: "cdte-cmos", term: "CdTe-CMOS", def: "A hybrid architecture in which a CdTe detector is bump-bonded to a CMOS readout ASIC; used in the UFS and Industrial IP67 TDI." },
  { id: "cmos-readout", term: "CMOS readout", def: "The integrated circuit layer that collects, amplifies and digitizes the charge signals from each detector pixel." },
  { id: "asic", term: "ASIC", def: "Application-specific integrated circuit — a full-custom readout chip designed for one specific detector rather than assembled from general-purpose parts." },
  { id: "tdi", term: "TDI (Time Delay Integration)", def: "A line-scan readout technique synchronized with object motion so that successive detector rows accumulate signal from the same object slice, improving signal-to-noise ratio." },
  { id: "mtf", term: "MTF (Modulation Transfer Function)", def: "A measure of how much contrast a detector preserves at each spatial frequency; higher MTF at high frequencies means sharper images." },
  { id: "dqe", term: "DQE (Detective Quantum Efficiency)", def: "A measure of how efficiently a detector converts incident X-ray information into image signal-to-noise ratio, as a function of spatial frequency and dose." },
  { id: "lp-mm", term: "lp/mm (line pairs per millimetre)", def: "A unit of spatial resolution: the finest pattern of alternating light and dark lines an imaging system can distinguish." },
  { id: "dynamic-range", term: "Dynamic range", def: "The ratio between the largest and smallest signals a detector can record in a single image; wider dynamic range preserves detail in both thin and dense regions." },
  { id: "photon-counting", term: "Photon counting", def: "A readout mode that detects and counts individual X-ray photons, optionally sorting them by energy. Distinct from direct conversion, which describes the conversion pathway, not the readout." },
  { id: "charge-integration", term: "Charge integration (energy integration)", def: "A readout mode that accumulates the charge from many photons over an exposure window and digitizes the total. The readout mode used in Athlos sensors." },
  { id: "single-photon-sensitivity", term: "Single-photon sensitivity", def: "A noise floor low enough that the charge from a single X-ray photon is detectable. Athlos sensors are single-photon sensitive while using charge-integrating readout — they do not count photons individually." },
  { id: "bump-bonding", term: "Bump bonding", def: "Joining a pixelated detector to a readout chip with microscopic solder or indium bumps — one electrical connection per pixel." },
  { id: "flip-chip-bonding", term: "Flip-chip bonding", def: "The assembly process of flipping and precision-aligning a chip face-down onto another die or substrate; used to hybridize detector material and readout ASIC." },
  { id: "readout-noise", term: "Readout noise", def: "Electronic noise added by the readout chain, which sets a floor on the smallest signal a detector can distinguish." },
  { id: "spatial-resolution", term: "Spatial resolution", def: "The ability of an imaging system to distinguish small, closely spaced details, commonly characterized with MTF and expressed in lp/mm." },
];

// Peer-reviewed publications by the Simage/Ajat team — historical
// lineage sources. The YXLON DICT100TL evaluation (2007) is
// deliberately EXCLUDED: the document is confidential and may not be
// published or cited without YXLON's written permission (decision D1).
const citations = [
  {
    title: "A novel semiconductor pixel device and system for X-ray and gamma ray imaging",
    authors: "Allison, Epenetos, Jalas, Karim, Myers, Orava, Pyyhtiä, Salonen, Sanghera, Sarakinos, Schulman, Spartiotis, Suni, Tieliang",
    org: "Simage Oy / SEFT / Hammersmith Hospital / VTT / HKUST",
    venue: "IEEE Nuclear Science Symposium conference record",
    year: "1997",
    url: "",
    finding: "Demonstrated CdZnTe and Si pixel detectors (35 µm pitch) flip-chip bonded to charge-integrating ASICs and tiled into large-area mosaics, with first preclinical and clinical images.",
    why: "Established the hybrid direct conversion pixel-detector architecture — semiconductor bonded to CMOS — still used today.",
  },
  {
    title: "A direct X-ray digital radiology system for use in mammography, dental imaging, fluoroscopy and conventional X-ray examinations",
    authors: "Spartiotis, Orava, Schulman, Pyyhtiä, Gao, Sarakinos, Suni, Salonen, Grönberg, Majander, Karim, Allison, Sanghera, Myers, Epenetos",
    org: "Simage Oy",
    venue: "CAR'97 — Computer Assisted Radiology and Surgery, Elsevier",
    year: "1997",
    url: "",
    finding: "Demonstrated a complete direct digital radiology system built from removable, tiled detector modules.",
    why: "Showed direct conversion as a practical system approach across several clinical modalities as early as 1997.",
  },
  {
    title: "A directly converting high-resolution intra-oral X-ray imaging sensor",
    authors: "Spartiotis, Pyyhtiä, Schulman, Puhakka, Muukkonen",
    org: "",
    venue: "Nuclear Instruments and Methods in Physics Research A 501 (2003) 594–601",
    year: "2003",
    url: "https://doi.org/10.1016/S0168-9002(03)00615-6",
    finding: "Si pixel detector (35 µm) bump-bonded to charge-integrating CMOS; X-rays converted \"directly to electrical charge in the depleted detector material yielding minimum lateral signal spread and maximum image sharpness.\"",
    why: "The direct technological ancestor of the DC-Air® intraoral sensor.",
  },
  {
    title: "A CdTe real time X-ray imaging sensor and system",
    authors: "Spartiotis, Havulinna, Leppänen, Pantsar, Puhakka, Pyyhtiä, Schulman",
    org: "Ajat Oy",
    venue: "Nuclear Instruments and Methods in Physics Research A 527 (2004) 478–486",
    year: "2004",
    url: "https://www.sciencedirect.com/science/article/abs/pii/S0168900204009465",
    finding: "CdTe pixel detectors (100 µm) bump-bonded to CMOS running at up to 60 fps, with a bias-cycling scheme eliminating CdTe polarization.",
    why: "Solved key CdTe material-stability challenges and established real-time CdTe-CMOS imaging — the foundation of the panoramic and cephalometric product line.",
  },
  {
    title: "A photon counting CdTe gamma- and X-ray camera",
    authors: "Spartiotis, Leppänen, Pantsar, Pyyhtiä, Laukka, Muukkonen, Männistö, Kinnari, Schulman",
    org: "Ajat Oy",
    venue: "Nuclear Instruments and Methods in Physics Research A 550 (2005) 267–277",
    year: "2005",
    url: "https://doi.org/10.1016/j.nima.2005.04.081",
    finding: "Photon-counting CdTe camera with a custom ASIC: 4.7 keV FWHM energy resolution at 122 keV.",
    why: "Documents the breadth of the team's readout design expertise, from charge integration to photon counting. Current Athlos products use charge-integrating readout.",
  },
];

export default { datePublished, dateModified, faq, glossary, citations };

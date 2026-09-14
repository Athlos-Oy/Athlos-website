# UFS 225 conversion film

The homepage now starts with the user's UFS 225 CAD assembly, opens its lid, approaches the detector and transitions to a sequential, explicitly conceptual comparison. This replaces the earlier SVG-only proposal. Source geometry proportions are preserved; the user confirmed that the CAD and reference photographs represent the same UFS 225 product.

## Sequence and controls

One 20-second clock connects the real product, incoming photon, magnified cross-section, conversion, readout and persistent SVG distributions:

- 0–3.4 s: incoming X-ray, lid reveal and a continuous approach from the CAD sensor to its conceptual cross-section.
- 3.4–4.2 s: photon enters CdTe and disappears at absorption.
- 4.2–6.3 s: localized charge generation, drift and CMOS pixel response.
- 6.2–7.9 s: visible signal travels from readout to the plot; the narrow profile grows after arrival.
- 8.4–9.4 s: direct profile shrinks into a retained reference while the scintillator scene enters at the same angle and scale.
- 9.5–12.6 s: X-ray absorption, visible light generation and lateral optical travel to the photodiode.
- 12.6–14.9 s: light converts into electrical charge, multiple readout pixels respond and the wider profile grows after signal arrival.
- 15.7–16.8 s: those same two SVG plots move into the final comparison.
- 16.8–17.9 s: hold both profiles for about one second.
- 17.9–20 s: soft return to the product and loop.

Pause/Play, four keyboard-operable chapter buttons and a timeline slider permit inspection. Selecting a chapter or scrubbing pauses the film. Animation stops offscreen or when the document is hidden. Camera position stays stable during each conversion event. The renderer is not disabled for automated browsers: tests exercise real WebGL.
Reduced-motion preference (including changes during playback), failed asset loading and unavailable/lost WebGL retain a rendered product poster with the complete textual explanation. All copy uses the existing five-locale i18n system. WebGL, Three, the decoder and GLB load only when the section approaches the viewport.

## Assets and materials

`images/conversion/ufs225.glb` is derived from the supplied standard `ufs-225-ip67-assy-v10.stp` (Creo export, 2023-12-29). The W variant was inspected but is not bundled. Neither original STEP files nor source assembly metadata are published with the site.

The source was converted locally with native Open Cascade (cadquery-ocp 8.0.1.0.0): STEPCAFControl → XCAF assembly → BRepMesh (0.15 mm linear / 0.4 rad angular deflection) → RWGltf. The intermediate GLB was about 30 MB, containing 939,808 triangles across mesh definitions. A local preparation pass baked transforms, discarded line primitives, assigned nine semantic material groups, welded and conservatively simplified geometry, removed source names and compressed the result with meshoptimizer. The web asset is about 3.2 MB, with nine mesh groups; lid groups remain independent.

Rendering uses existing Three r160, matching r160 GLTFLoader/BufferGeometryUtils/RoomEnvironment, and the vendored MIT meshoptimizer decoder. Licenses are retained in js/vendor. There is no CDN or third-party runtime request.

The photographs guide dark metal, mounting brackets, woven carbon and the silver Athlos brand mark. Carbon finish is applied to a plane matching the CAD carbon-sheet bounds because CAD surface overlays obscure the recessed sheet after tessellation. The brand decal uses the site's existing logo. Interior details are the supplied CAD geometry, not a reconstruction of every photographed cable and board marking. Source nodes lacking geometry were skipped by native export; this is a visualization asset, not a fabrication model.

## Scientific interpretation

Optical tracks are straight rays emitted in different directions from the interaction site. The animation shows a representative subset reaching the photodiode, not the full angular emission or a calibrated transport simulation. Scattering and boundary reflections would change direction at discrete interactions; no smoothly curved photon trajectories are depicted. Transit times are slowed for explanation.

The microscopic scene is distinct from the actual product. It does not imply that this camera contains an indirect-conversion sensor. Indirect conversion shows optical spread in a scintillator before charge collection; direct conversion shows a localized charge distribution with nonzero neighbouring response. Both profiles have equal peak height and the same horizontal scale; they compare width, not measured efficiency or calibrated detector performance. No inference of zero noise, perfect collection or zero charge spreading is intended.

## Validation

Run `npm run build`, `npm run check:i18n`, and `npx playwright test tests/conversion.spec.js`. The dedicated tests cover lazy loading, real CAD rendering, chapters, pause/resume, offscreen suspension, dynamic reduced motion, failed model loading, absent WebGL, mobile width, keyboard controls and no-JavaScript content.

Desktop (1440 px) and mobile (390 px) playback and keyframes are reviewed locally. Tests also verify that the original plot nodes persist through comparison and that profile growth follows signal arrival. Existing whole-site screenshot baselines target Linux and have not been rewritten on Windows; the intentional homepage visual change needs Linux baseline review. No production deployment is part of this change.



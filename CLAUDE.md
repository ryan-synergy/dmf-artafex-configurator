# DMF Artafex Field Configurator — Project Brief

A field tool for lighting integrators: walk a (often retrofit) home, survey existing fixtures, spec DMF Artafex products room-by-room with guided, compatibility-checked taps, and export a verified, orderable take-off (PDF / Excel / JSON). Single-file HTML app, runs offline, installable as a PWA.

## ⚠️ The one rule: VERIFIED SKUs ONLY

Part numbers go to customers — a wrong SKU is a wrong order. **Never infer or guess a SKU.** Decode it from an authoritative source, then prove it with the test harness before shipping any change.

- **Catalog (DMF Product Guide)** is authoritative for housings, trims, accessories.
- **Spec sheets** are authoritative for the **module** builder — the catalog omits module part numbers ("reference product spec sheets"). This gap is always present; obtain spec sheets for any line's modules.
- Every emitted line carries a confidence flag (✓ verified / verify). Don't present unverified SKUs as final.
- The two `reference/*.md` files are the canonical decoded grammar — keep them in sync with the code.

## File layout

```
DMF_Artafex4_Field_Configurator.html   ← the entire app (HTML+CSS+JS, single file)
specs/                                  ← bundled spec-sheet PDFs (referenced by the app, offline)
reference/
  Artafex4_Verified_SKU_Reference.md    ← A4 grammar, rules, wattage, doc URLs
  Artafex2_Verified_SKU_Reference.md    ← A2 grammar, rules, doc URLs
test/verify.js                          ← regression tests (SKU assembly + DOM smoke + store/sync)
manifest.json / sw.js / icon-*.png      ← PWA shell (deployed by the workflow; sw cache name must be bumped when the shell changes)
.github/workflows/deploy.yml            ← CI: npm test gate → GitHub Pages deploy (copies app to index.html)
package.json                            ← `npm test`, `npm run serve`
```

The app is **deliberately one file** (easy to host, email, drop on a phone). Don't split it without a reason.

## Architecture (inside the HTML `<script>`)

- **Data:** `const C` (Artafex 4) and `const C2` (Artafex 2); `const LINES={'4':C,'2':C2}`; dispatcher `Lc(g)` returns the active line's data. Shared arrays (lumens, cct, dim, wattByLum) are referenced across both.
- **SKU builders:** `skuHousing` / `skuModule` / `skuTrim` branch on `g.line`. `groupKit(g)` assembles the per-fixture BOM (line-aware accessories, retrofit, auto mud-kit).
- **Availability:** `housingAvail`, `lumensAvail`, `cctAvail`, `beamAvail`, `dimAvail`, `trimStyleAvail`, `trimFinishAvail`, `trimOptionAvail` all read `Lc(g)`. `normalize(g)` snaps invalid selections valid; called at the top of `configFields`.
- **UI:** `configFields(cfg,g,re)` renders the guided chip taps with a Product-line selector first. `cctField` shows color swatches.
- **Data model:** Jobsite → rooms → groups (qty). `JOB.defaults` (House Defaults, inherited by new groups, cascade = new only). `room.existing` (as-found survey, reference-only). `roomRecon` (existing-vs-proposed nudge). Reports in `openReport` / `buildRows` / `exportPDF` (confidence flags + connected-load; user text goes through `esc()` before innerHTML). `docsFor(g)` → spec/install/IES, local bundle + hosted fallback.
- **Persistence (multi-job):** `STORE = {jobs:[], currentId, sync:{owner,repo,branch,token,shas,pushed,tombstones}}` at key `dmf_artafex_store_v1`; legacy key `dmf_artafex4_job_v1` is auto-migrated on boot. `save()` = bump `JOB.updated` + `saveStore()` + `queuePush()`. Jobs modal: `openJobs`/`renderJobs`/`switchJob`/`dupJob`/`deleteJob`. `importJSON` adds to the list (non-destructive), backfills missing fields.
- **GitHub sync (optional, local-first):** each job is `jobs/<id>.json` in a **private** repo the user owns, via the Contents API with a fine-grained PAT (Contents R/W on that repo only). `pushJob` (sha-tracked, 409 retry = last-write-wins by `job.updated`), `syncNow` (pull list → pull changed → push dirty), `queuePush` (2.5 s debounce after `save()`), tombstones so deletions don't resurrect. Everything must keep working with sync unconfigured/offline.

## SKU grammar (verified — see reference/ for full tables)

- A4 Housing `M4+install+shape+rating` (special `M4CC`); Module `ART4[D/A]+lum+T+cct+beam+[W]+dim`; Trim `M4T+shape+style+finish+option`; Retrofit `DRD2TR+aper+style+finish` + `DRD2X-QCM-*`.
- A2 Housing `X2+install+shape` (Remodel → `RM` TRIAC / `RD` digital); Module `ART2[D/A]+lum+T+cct+beam+dim` (no finish code); Trim `X2T+shape+module+style+finish+option(MF/FL)`; Retrofit = `X2` trims + `X2KRRETRO6/45`, `X2KSRETRO6`.
- Wattage: 750=9.5W · 1000=12.5W (14.5W digital) · 1250/1500=14.3W.

## How to add a product line (Artafex 1, Cylinders, Surface, …)

1. Get the catalog pages **and** the spec sheets (modules need them). Record the printed `EXAMPLE:` SKUs as test fixtures.
2. Add `const C<n>` (housings, beams, trimStyles, trimFinish, trimOption, modFinish or null, retrofit); add to `LINES`.
3. Branch `skuHousing/skuModule/skuTrim/groupKit/groupNotes` for the new grammar.
4. Add the line to the `configFields` Product-line selector + any line-specific UI.
5. Bundle spec PDFs into `specs/`; extend `docsFor` (spec/install/IES + hosted URLs).
6. Add assertions to `test/verify.js`; update the line's `reference/*.md`.
7. **`npm test` must pass before committing.**

## Verification protocol (mandatory)

```
npm install      # first time (installs jsdom)
npm test         # SKU assembly + DOM smoke; exits non-zero on any failure
```

`test/verify.js` asserts each builder reproduces the printed spec-sheet `EXAMPLE:` SKUs for both lines and runs a jsdom smoke (render, switch line, open report). Never ship red.

## Publishing / PWA

- **GitHub Pages via Actions**: pushing to `master`/`main` runs `npm test`, then `.github/workflows/deploy.yml` assembles the site (`DMF_Artafex4_Field_Configurator.html` → `index.html`, + manifest/sw/icons/specs) and deploys to Pages. `git push` IS the deploy — never push red.
- The app repo is **public** (Pages free tier). Job data lives in a separate **private** repo (`dmf-jobs`) written by the app at runtime — never commit job data or tokens here.
- **Service workers need http(s)** — test the installable/offline behavior with `npm run serve` (`python3 -m http.server 8080`) and open `http://localhost:8080`, not the `file://` path.
- In-app **⬇ Save offline** caches the app + all spec sheets + the xlsx/jsPDF CDN libs (active when served over http). When the PWA shell files change, bump `CACHE` in `sw.js`.
- `dmf-artafex-webapp.zip` (gitignored) is the legacy drag-drop bundle; rebuild it only if a drag-drop host is still needed.

## Known next steps / backlog

- More product lines: Artafex 1, Cylinders, Surface Mount.
- Client-ready quote header (customer / prepared-by / dealer) on reports.
- Quoting-software export: ask what format their quoting tool ingests (CSV columns?) and add a dedicated export.
- Sync edge: deleting a job on device A while device B still holds a local copy can resurrect it from B (acceptable v1 trade-off; fix = real tombstone file in the repo).

## Gotchas

- The app needs `specs/` alongside it for the offline 📄 buttons; online ↗ links work regardless.
- The sync token is stored in `localStorage` per device; it must be a fine-grained PAT scoped to the one private jobs repo, Contents R/W only.
- There's a companion **skill** (`dmf-artafex-configurator.skill`) that encodes this same playbook; it works in Claude Code too.

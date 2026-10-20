# Power BI Desktop Handbook — Weekly PM Report

> **Living Document**: Updated continuously by scheduled Google Jules agents.
> **Target Release**: Microsoft Power BI Desktop (optimized for Report Server, Jan 2026, build `2.150.5353.0`)
> **Division of Concerns**: Report-level visual cataloging, layout, formatting, and offline handbooks live here. Semantic modeling & DAX live in `powerbi-modeling-mcp`.

---

## 1. Executive Summary & Sprint Goals

### Current Sprint Focus
- [ ] **Example Coverage Expansion**: Add manifest examples for Decomposition Tree, Gauge, Waterfall, KPI, and Scatter using their existing exact-build field-role evidence. Inspect the target Desktop UI before making additional format-pane claims.
- [ ] **Optional Structured-Field Examples**: Demonstrate `{ role, field, kind, aggregation }` assignments where useful. Legacy string fields and the user-facing `Matrix` alias for `pivotTable` remain supported; no migration is required.
- [ ] **Schema & Contract Verification**: Ensure all manifests validate against `schemas/manifest.schema.json` and `model-contract` extracts clean TMDL/DAX contracts.
- [ ] **Canvas Preview & Theme Fidelity**: Validate SVG visual mockups in Blueprint and Mockup modes against deuteranopia and custom theme palettes.
- [ ] **Zero-Drift & Offline Hygiene**: Enforce 100% offline standalone HTML constraint (no external CDNs) and pass `audit:public` with zero rebuild drift.

---

## 2. Agent Status Board

| Agent | Icon | Schedule | Last Run | Status | Key Deliverables / Findings |
|---|:---:|---|---|:---:|---|
| **AI PM Manager** | 🧭 | Mon 00:00 GMT+7 | 2026-10-12 | Backlog reviewed | Separated missing examples from verified field-role evidence and optional structured-field adoption. |
| **Sentinel** | 🛡️ | Mon 10:00 GMT+7 | 2026-10-12 | ✅ **PASS** | Publication audit passed, no leaks detected, schema checksum valid, 0 remote dependencies found |
| **Ledger** | 🧾 | Tue 10:00 GMT+7 | 2026-10-20 | ✅ **PASS** | Validated manifests (102 UI warnings). Extracted model contracts successfully. Verified field-roles backward compatibility. |
| **Palette** | 🎨 | Wed 10:00 GMT+7 | 2026-10-14 | ✅ **PASS** | Verified canvas SVG mocks, pure CSS responsive layout, deuteranopia theme cascading, and print rules. No remote dependencies found. Recommendation: Consider adding explicit contrast-ratio testing in CI for generated data colors against the background. |
| **Plumber** | 🔧 | Thu 10:00 GMT+7 | Pending | ⏳ Scheduled | Verify zero-dependency CLI health and the supported CI toolchain. |
| **Bolt** | ⚡ | Fri 10:00 GMT+7 | 2026-10-12 | Payload reduction verified | PR #1 reduced the largest guide from 4,907,784 to 2,879,258 bytes by removing duplicate per-placement catalog formatting; controlled timing and browser load checks remain pending. |
| **Radar** | 📡 | Sat 10:00 GMT+7 | 2026-10-17 | ✅ **PASS** | Run complete automated test suite (`npm test`, `npm run rebuild-check`, `npm run detect`, `npm run audit:public`). All passed with 0 drift. Expanded test coverage to include Decomposition Tree, Gauge, KPI, empty/single-visual edge cases and invalid aggregations. |
| **Scribe** | 📜 | Sun 10:00 GMT+7 | 2026-10-18 | ✅ **PASS** | Documentation updated. README example list and changelog synchronized; test additions logged. |

---

## 3. Active Blockers & Critical Findings

- ✅ **Sentinel run complete (2026-10-12)**: Public audit passed. No private leaks detected. Gitignore boundaries intact. Schema checksums valid against release profile. Zero remote dependencies found in HTML examples.
- ✅ **Ledger run complete (2026-10-20)**: Validated all example manifests against schemas (no errors, 102 warnings for UI instructions lacking schema assertions). Extracted semantic model contracts successfully. Confirmed structured-field assignments and legacy string syntax both work. Visual types mapped correctly (Matrix -> pivotTable, distinct cards).
- **Example backlog**: The five visuals listed below lack example placements. This is coverage work, not a blocker to the current generator workflow.
- **Pending manual checks**: Any new live Desktop format-pane evidence remains unverified by the automated maintenance checks.

---

## 4. Visual Catalog Coverage & Evidence Matrix

- **Pinned Build**: `2.150.5353.0` (January 2026 Report Server)
- **Manifests Tracked**:
  - `examples/sample-dashboard.json` (3 visuals: current Card, clustered bar, Matrix)
  - `examples/executive-sales-dashboard.json` (Multi-visual executive overview)
  - `examples/sales-scorecard.json` (9 visuals, conditional formatting, matrix)
  - `examples/university-of-melbourne.json` (Treemap, table, line, custom theme)
  - `examples/opportunity-analysis.json` (26 visuals, 4-quadrant layout, deuteranopia-accessible palette)

The pinned `references/build/2.150.5353.0.json` marks the field roles for each visual below as verified. None is placed in the five current example manifests. Field-role verification does not establish additional format-pane settings, role capacity, requiredness, accepted kinds, or aggregation defaults.

| Visual | Catalog ID | Exact-build field-role evidence | Example placement |
|---|---|---|---|
| Decomposition Tree | `decompositionTreeVisual` | Verified | Pending |
| Gauge | `gauge` | Verified | Pending |
| Waterfall | `waterfallChart` | Verified | Pending |
| KPI | `kpi` | Verified | Pending |
| Scatter | `scatterChart` | Verified | Pending |

Legacy string fields and structured objects can coexist within a manifest. `Matrix` resolves to `pivotTable`; neither spelling indicates an unversioned or unsupported visual.

---

## 5. Archive & Sprint History Log

<details>
<summary>Verified Maintenance Results — 2026-10-18</summary>

- Radar expanded handbook test coverage to include Decomposition Tree, Gauge, KPI, single-visual edge cases, malformed themes, and invalid aggregations. All automated CI checks passed.
- Scribe finalized the weekly changelog and PM report documentation closeout.
- Automated validation workflows continue to block schema inference when a specific `buildRoles` observation dictates otherwise.
</details>

<details>
<summary>Verified Maintenance Results — 2026-10-12</summary>

- The combined changes from PRs #1, #3, and #5 passed all 12 local tests, manifest validation, publication auditing, model-contract extraction, and rebuild comparisons for all five guides.
- GitHub CI passed on Node.js 20 and 22 on Ubuntu and Windows for the merged main commit `d7d336e6c508c8f6904a32a503686fd855445bb4`.
- README now lists all five example manifests. Matrix remains the supported user-facing alias for `pivotTable`; legacy string fields and structured field objects are both supported.
- These automated results do not establish completion of live Desktop UI inspection, browser interaction, accessibility, or theme-fidelity checks.
</details>

<details>
<summary>Initial Setup (Pre-Sprint Baseline)</summary>

- Initialized 8 scheduled Google Jules agents (`AI PM Manager`, `Sentinel`, `Ledger`, `Palette`, `Plumber`, `Bolt`, `Radar`, `Scribe`).
- Configured single living report workflow in `docs/weekly/pm-report.md`.
- Target release profile pinned to build `2.150.5353.0`.
- All 5 example guides rebuilt and verified offline.
</details>

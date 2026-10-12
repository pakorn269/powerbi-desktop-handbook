# Power BI Desktop Handbook — Weekly PM Report

> **Living Document**: Updated continuously by scheduled Google Jules agents.
> **Target Release**: Microsoft Power BI Desktop (optimized for Report Server, Jan 2026, build `2.150.5353.0`)
> **Division of Concerns**: Report-level visual cataloging, layout, formatting, and offline handbooks live here. Semantic modeling & DAX live in `powerbi-modeling-mcp`.

---

## 1. Executive Summary & Sprint Goals

### Current Sprint Focus
- [ ] **Visual Catalog Expansion**: Verify field-roles and formatting options for core visuals. We need manifest examples or live-UI verification evidence for Decomposition Tree, Gauge, Waterfall, KPI, and Scatter visuals.
- [ ] **Legacy Syntax Update**: Update legacy string syntax for fields (e.g. `"Measures[Open incidents]"`) to structured objects (`{ role, field, kind }`) across all example manifests (`examples/*.json`). Update legacy unversioned visual syntax (`"type": "Matrix"`) to `"type": "pivotTable"` in `sample-dashboard.json` and `executive-sales-dashboard.json`.
- [ ] **Schema & Contract Verification**: Ensure all manifests validate against `schemas/manifest.schema.json` and `model-contract` extracts clean TMDL/DAX contracts.
- [ ] **Canvas Preview & Theme Fidelity**: Validate SVG visual mockups in Blueprint and Mockup modes against deuteranopia and custom theme palettes.
- [ ] **Zero-Drift & Offline Hygiene**: Enforce 100% offline standalone HTML constraint (no external CDNs) and pass `audit:public` with zero rebuild drift.

---

## 2. Agent Status Board

| Agent | Icon | Schedule | Last Run | Status | Key Deliverables / Findings |
|---|:---:|---|---|:---:|---|
| **AI PM Manager** | 🧭 | Mon 00:00 GMT+7 | 2026-10-12 | ✅ Completed | Weekly sprint kickoff, backlog audit, triage |
| **Sentinel** | 🛡️ | Mon 10:00 GMT+7 | Pending | ⏳ Scheduled | Audit public release blocklists, schema hashes, and offline script isolation. |
| **Ledger** | 🧾 | Tue 10:00 GMT+7 | Pending | ⏳ Scheduled | Validate manifest schemas and check model-contract exports. |
| **Palette** | 🎨 | Wed 10:00 GMT+7 | Pending | ⏳ Scheduled | Check SVG visual mockup fidelity and theme contrast. |
| **Plumber** | 🔧 | Thu 10:00 GMT+7 | Pending | ⏳ Scheduled | Verify zero-dependency CLI execution and CI matrix. |
| **Bolt** | ⚡ | Fri 10:00 GMT+7 | Pending | ⏳ Scheduled | Benchmark HTML guide file sizes and generator build speed. |
| **Radar** | 📡 | Sat 10:00 GMT+7 | Pending | ⏳ Scheduled | Run full test suite and rebuild-check verification. |
| **Scribe** | 📜 | Sun 10:00 GMT+7 | Pending | ⏳ Scheduled | Synchronize documentation and update CHANGELOG. |

---

## 3. Active Blockers & Critical Findings

- **Missing Visual Catalog Coverage**: Manifest examples or live-UI verification evidence are missing for Decomposition Tree, Gauge, Waterfall, KPI, and Scatter visuals based on `references/build/2.150.5353.0.json`.
- **Legacy Syntax in Manifests**: All example manifests use legacy string syntax for fields instead of the structured `{ role, field, kind }` objects. Also, `sample-dashboard.json` and `executive-sales-dashboard.json` use the legacy `"type": "Matrix"` instead of `"type": "pivotTable"`. These need to be updated.

---

## 4. Visual Catalog Coverage & Evidence Matrix

- **Pinned Build**: `2.150.5353.0` (January 2026 Report Server)
- **Manifests Tracked**:
  - `examples/sample-dashboard.json` (Core visuals: card, bar, slicer) - *Flags: Legacy string fields, legacy `Matrix` syntax.*
  - `examples/executive-sales-dashboard.json` (Multi-visual executive overview) - *Flags: Legacy string fields, legacy `Matrix` syntax.*
  - `examples/sales-scorecard.json` (9 visuals, conditional formatting, matrix) - *Flags: Legacy string fields.*
  - `examples/university-of-melbourne.json` (Treemap, table, line, custom theme) - *Flags: Legacy string fields.*
  - `examples/opportunity-analysis.json` (26 visuals, 4-quadrant layout, deuteranopia-accessible palette) - *Flags: Legacy string fields.*
- **Missing Visual Coverage**: Decomposition Tree, Gauge, Waterfall, KPI, Scatter.

---

## 5. Archive & Sprint History Log

<details>
<summary>Previous Sprint</summary>

- [x] **Visual Catalog Expansion**: Verify field-roles and formatting options for core visuals (Matrix, Decomposition Tree, Gauge, KPI).
- [x] **Schema & Contract Verification**: Ensure all manifests validate against `schemas/manifest.schema.json` and `model-contract` extracts clean TMDL/DAX contracts.
- [x] **Canvas Preview & Theme Fidelity**: Validate SVG visual mockups in Blueprint and Mockup modes against deuteranopia and custom theme palettes.
- [x] **Zero-Drift & Offline Hygiene**: Enforce 100% offline standalone HTML constraint (no external CDNs) and pass `audit:public` with zero rebuild drift.
</details>

<details>
<summary>Initial Setup (Pre-Sprint Baseline)</summary>

- Initialized 8 scheduled Google Jules agents (`AI PM Manager`, `Sentinel`, `Ledger`, `Palette`, `Plumber`, `Bolt`, `Radar`, `Scribe`).
- Configured single living report workflow in `docs/weekly/pm-report.md`.
- Target release profile pinned to build `2.150.5353.0`.
- All 5 example guides rebuilt and verified offline.
</details>

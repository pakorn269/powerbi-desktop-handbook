# Power BI Desktop Handbook — Weekly PM Report

> **Living Document**: Updated continuously by scheduled Google Jules agents.
> **Target Release**: Microsoft Power BI Desktop (optimized for Report Server, Jan 2026, build `2.150.5353.0`)
> **Division of Concerns**: Report-level visual cataloging, layout, formatting, and offline handbooks live here. Semantic modeling & DAX live in `powerbi-modeling-mcp`.

---

## 1. Executive Summary & Sprint Goals

### Current Sprint Focus
- [ ] **Visual Catalog Expansion**: Verify field-roles and formatting options for core visuals (Matrix, Decomposition Tree, Gauge, KPI).
- [ ] **Schema & Contract Verification**: Ensure all manifests validate against `schemas/manifest.schema.json` and `model-contract` extracts clean TMDL/DAX contracts.
- [ ] **Canvas Preview & Theme Fidelity**: Validate SVG visual mockups in Blueprint and Mockup modes against deuteranopia and custom theme palettes.
- [ ] **Zero-Drift & Offline Hygiene**: Enforce 100% offline standalone HTML constraint (no external CDNs) and pass `audit:public` with zero rebuild drift.

---

## 2. Agent Status Board

| Agent | Icon | Schedule | Last Run | Status | Key Deliverables / Findings |
|---|:---:|---|---|:---:|---|
| **AI PM Manager** | 🧭 | Mon 00:00 GMT+7 | Pending | ⏳ Scheduled | Weekly sprint kickoff, backlog audit, triage |
| **Sentinel** | 🛡️ | Mon 10:00 GMT+7 | Pending | ⏳ Scheduled | Publication audit, leak check, schema hash integrity |
| **Ledger** | 🧾 | Tue 10:00 GMT+7 | Pending | ⏳ Scheduled | Manifest schema validation, field-roles, model-contract |
| **Palette** | 🎨 | Wed 10:00 GMT+7 | Pending | ⏳ Scheduled | Shell fidelity, SVG visual mocks, theme & a11y audit |
| **Plumber** | 🔧 | Thu 10:00 GMT+7 | Pending | ⏳ Scheduled | Zero-dependency CLI health, CI workflows, toolchain |
| **Bolt** | ⚡ | Fri 10:00 GMT+7 | Pending | ⏳ Scheduled | HTML guide size benchmarks, generation speed, storage |
| **Radar** | 📡 | Sat 10:00 GMT+7 | Pending | ⏳ Scheduled | Test suite run, rebuild-check drift, detect tests |
| **Scribe** | 📜 | Sun 10:00 GMT+7 | Pending | ⏳ Scheduled | Documentation sync, visual references, changelog update |

---

## 3. Active Blockers & Critical Findings

- *None currently blocking. Ready for initial Jules scheduled agent run.*

---

## 4. Visual Catalog Coverage & Evidence Matrix

- **Pinned Build**: `2.150.5353.0` (January 2026 Report Server)
- **Manifests Tracked**:
  - `examples/sample-dashboard.json` (Core visuals: card, bar, slicer)
  - `examples/executive-sales-dashboard.json` (Multi-visual executive overview)
  - `examples/sales-scorecard.json` (9 visuals, conditional formatting, matrix)
  - `examples/university-of-melbourne.json` (Treemap, table, line, custom theme)
  - `examples/opportunity-analysis.json` (26 visuals, 4-quadrant layout, deuteranopia-accessible palette)

---

## 5. Archive & Sprint History Log

<details>
<summary>Initial Setup (Pre-Sprint Baseline)</summary>

- Initialized 8 scheduled Google Jules agents (`AI PM Manager`, `Sentinel`, `Ledger`, `Palette`, `Plumber`, `Bolt`, `Radar`, `Scribe`).
- Configured single living report workflow in `docs/weekly/pm-report.md`.
- Target release profile pinned to build `2.150.5353.0`.
- All 5 example guides rebuilt and verified offline.
</details>

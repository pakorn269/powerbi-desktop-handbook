# Power BI Desktop Handbook — Weekly PM Report

> **Living Document**: Updated continuously by scheduled Google Jules agents.
> **Target Release**: Microsoft Power BI Desktop (optimized for Report Server, Jan 2026, build `2.150.5353.0`)
> **Division of Concerns**: Report-level visual cataloging, layout, formatting, and offline handbooks live here. Semantic modeling & DAX live in `powerbi-modeling-mcp`.

---

## 1. Executive Summary & Sprint Goals

### Current Sprint Focus
- [ ] **Example Coverage Expansion**: Add manifest examples for Decomposition Tree, Gauge, Waterfall, KPI, and Scatter using their existing exact-build field-role evidence. Inspect the target Desktop UI before making additional format-pane claims.
- [ ] **Optional Structured-Field Examples**: Demonstrate `{ role, field, kind, aggregation }` assignments where useful. Legacy string fields and the user-facing `Matrix` alias for `pivotTable` remain supported; no migration is required.
- [ ] **Roadmap Alignment & Division of Concerns**: Ensure the clear separation of responsibilities holds—this repository focuses solely on visual catalog, layout, and handbook generation, while `powerbi-modeling-mcp` handles semantic modeling, DAX, and TMDL.
- [ ] **Schema & Contract Verification**: Ensure all manifests validate against `schemas/manifest.schema.json` and `model-contract` extracts clean TMDL/DAX contracts.
- [ ] **Canvas Preview & Theme Fidelity**: Validate SVG visual mockups in Blueprint and Mockup modes against deuteranopia and custom theme palettes.
- [ ] **Zero-Drift & Offline Hygiene**: Enforce 100% offline standalone HTML constraint (no external CDNs) and pass `audit:public` with zero rebuild drift.

---

## 2. Agent Status Board

| Agent | Icon | Schedule | Last Run | Status | Key Deliverables / Findings |
|---|:---:|---|---|:---:|---|
| **AI PM Manager** | 🧭 | Mon 00:00 GMT+7 | 2026-10-19 | ✅ **PASS** | Audited visual catalog roadmap, updated PM report, separated missing examples, and outlined cross-agent triage plan. |
| **Sentinel** | 🛡️ | Mon 10:00 GMT+7 | Pending | ⏳ Scheduled | Audit public release blocklists, schema hashes, and offline script isolation. |
| **Ledger** | 🧾 | Tue 10:00 GMT+7 | Pending | ⏳ Scheduled | Validate manifest schemas and check model-contract exports. |
| **Palette** | 🎨 | Wed 10:00 GMT+7 | Pending | ⏳ Scheduled | Check SVG visual mockup fidelity and theme contrast. |
| **Plumber** | 🔧 | Thu 10:00 GMT+7 | 2026-10-22 | ✅ **PASS** | Verified zero runtime dependencies. CLI pipeline executes successfully with correct error handling. Audited CI workflow and updated build step to use `npm run build`. Verified agent skill installation script. |
| **Bolt** | ⚡ | Fri 10:00 GMT+7 | Pending | ⏳ Scheduled | Benchmark HTML guide file sizes and generator build speed. |
| **Radar** | 📡 | Sat 10:00 GMT+7 | 2026-10-24 | ✅ **PASS** | Passed all 17/17 tests. Rebuild-check passed zero drift. Coverage already includes requested visual types and edge cases. |
| **Scribe** | 📜 | Sun 10:00 GMT+7 | Pending | ⏳ Scheduled | Synchronize documentation and update CHANGELOG. |

---

## 3. Active Blockers & Critical Findings

- **No critical blockers**.
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

### Manifest Specification for Missing Visuals

Manifests safely support legacy string arrays (e.g. `["Field"]`) and structured objects:
```json
{
  "role": "...",
  "field": "Table[Column]",
  "kind": "column",
  "aggregation": "Sum"
}
```

The field roles needed for each of the unplaced visuals are derived from Exact-build evidence:

| Visual | Catalog ID | Exact-build field-role evidence | Example placement |
|---|---|---|---|
| Decomposition Tree | `decompositionTreeVisual` | `analyze`, `explainBy`, `tooltips` | Pending |
| Gauge | `gauge` | `value`, `minimumValue`, `maximumValue`, `targetValue`, `tooltips` | Pending |
| Waterfall | `waterfallChart` | `category`, `breakdown`, `yAxis`, `tooltips` | Pending |
| KPI | `kpi` | `value`, `trendAxis`, `target` | Pending |
| Scatter | `scatterChart` | `values`, `xAxis`, `yAxis`, `legend`, `size`, `playAxis`, `tooltips` | Pending |

Legacy string fields and structured objects can coexist within a manifest. `Matrix` resolves to `pivotTable`; neither spelling indicates an unversioned or unsupported visual.

---

## 5. Archive & Sprint History Log

<details>
<summary>Verified Maintenance Results — 2026-10-12 to 2026-10-18</summary>

- Radar expanded handbook test coverage to include Decomposition Tree, Gauge, KPI, single-visual edge cases, malformed themes, and invalid aggregations. All automated CI checks passed.
- Scribe finalized the weekly changelog and PM report documentation closeout.
- Automated validation workflows continue to block schema inference when a specific `buildRoles` observation dictates otherwise.
- The combined changes from PRs #1, #3, and #5 passed all 12 local tests, manifest validation, publication auditing, model-contract extraction, and rebuild comparisons for all five guides.
- GitHub CI passed on Node.js 20 and 22 on Ubuntu and Windows for the merged main commit `d7d336e6c508c8f6904a32a503686fd855445bb4`.
- README now lists all five example manifests. Matrix remains the supported user-facing alias for `pivotTable`; legacy string fields and structured field objects are both supported.
- Sentinel run complete (2026-10-12): Public audit passed. No private leaks detected. Gitignore boundaries intact. Schema checksums valid against release profile. Zero remote dependencies found in HTML examples.
- Ledger run complete (2026-10-13): Validated all example manifests against schemas (no errors, 98 warnings for UI instructions lacking schema assertions). Extracted semantic model contracts successfully. Confirmed structured-field assignments and legacy string syntax both work. Visual types mapped correctly (Matrix -> pivotTable, distinct cards).
- Palette run complete (2026-10-14): Verified canvas SVG mocks, pure CSS responsive layout, deuteranopia theme cascading, and print rules. No remote dependencies found. Recommendation: Consider adding explicit contrast-ratio testing in CI for generated data colors against the background.
- Bolt run complete (2026-10-12): Payload reduction verified. PR #1 reduced the largest guide from 4,907,784 to 2,879,258 bytes by removing duplicate per-placement catalog formatting; controlled timing and browser load checks remain pending.
- These automated results do not establish completion of live Desktop UI inspection, browser interaction, accessibility, or theme-fidelity checks.
</details>

<details>
<summary>Initial Setup (Pre-Sprint Baseline)</summary>

- Initialized 8 scheduled Google Jules agents (`AI PM Manager`, `Sentinel`, `Ledger`, `Palette`, `Plumber`, `Bolt`, `Radar`, `Scribe`).
- Configured single living report workflow in `docs/weekly/pm-report.md`.
- Target release profile pinned to build `2.150.5353.0`.
- All 5 example guides rebuilt and verified offline.
</details>

<details>
<summary>Draft Summary: Sprint Closeout (To be folded by AI PM Manager)</summary>

- Scribe agent run completed successfully.
- Added visual catalog mappings in `references/visuals/2.150.json` for Decomposition Tree (`decompositionTreeVisual`), Gauge (`gauge`), Waterfall (`waterfallChart`), KPI (`kpi`), and Scatter (`scatterChart`) to formally track them in the catalog.
- Verified README, AGENTS, and CONTRIBUTING documentation were up-to-date and completely accurate.
- `CHANGELOG.md` updated to reflect this week's commits, specifically auditing the CLI/CI pipeline (PR #15).
- Re-ran test, validate, audit, build, and rebuild-check steps successfully, resulting in a zero-drift clean sprint state.
</details>

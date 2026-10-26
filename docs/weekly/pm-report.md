# Power BI Desktop Handbook — Weekly PM Report

> **Living Document**: Updated continuously by scheduled Google Jules agents.
> **Target Release**: Microsoft Power BI Desktop (optimized for Report Server, Jan 2026, build `2.150.5353.0`)
> **Division of Concerns**: Report-level visual cataloging, layout, formatting, and offline handbooks live here. Semantic modeling & DAX live in `powerbi-modeling-mcp`.

---

## 1. Executive Summary & Sprint Goals

### Current Sprint Focus
- [ ] **Visual Catalog Coverage Audit**: Generate manifest examples for Decomposition Tree, Gauge, Waterfall, KPI, and Scatter visuals using exact-build field-role evidence. Ensure evidence is live-UI verified before declaring full support.
- [ ] **Manifest Best Practices**: Ensure field role documentation is exhaustive for all visuals and eliminate legacy, unversioned syntax in generated output.
- [ ] **Roadmap Drift Prevention**: Synchronize newly added features, CLI flags, and visual guides with `README.md` and `plan.md`.
- [ ] **Division of Concerns**: Strictly maintain boundary with `powerbi-modeling-mcp` (which handles semantic modeling, DAX, TMDL); this repo focuses on visual catalogs, layout, and handbook generation.
- [ ] **Cross-Agent Coordination**: Direct and manage the workload for Sentinel, Ledger, Palette, Plumber, Bolt, Radar, and Scribe to ensure continuous testing, security auditing, schema enforcement, UI mockup checks, build speed, and repo hygiene.

---

## 2. Agent Status Board

| Agent | Icon | Schedule | Last Run | Status | Key Deliverables / Findings |
|---|:---:|---|---|:---:|---|
| **AI PM Manager** | 🧭 | Mon 00:00 GMT+7 | 2026-10-26 | ✅ **PASS** | Audited alignment between visual catalog, manifest spec, and examples. Triage and sprint focus setup for the week. |
| **Sentinel** | 🛡️ | Mon 10:00 GMT+7 | Pending | ⏳ Scheduled | Audit public release blocklists, schema hashes, and offline script isolation. |
| **Ledger** | 🧾 | Tue 10:00 GMT+7 | Pending | ⏳ Scheduled | Validate manifest schemas and check model-contract exports. |
| **Palette** | 🎨 | Wed 10:00 GMT+7 | Pending | ⏳ Scheduled | Check SVG visual mockup fidelity and theme contrast. |
| **Plumber** | 🔧 | Thu 10:00 GMT+7 | Pending | ⏳ Scheduled | Verify zero-dependency CLI execution and CI matrix. |
| **Bolt** | ⚡ | Fri 10:00 GMT+7 | Pending | ⏳ Scheduled | Benchmark HTML guide file sizes and generator build speed. |
| **Radar** | 📡 | Sat 10:00 GMT+7 | Pending | ⏳ Scheduled | Run full test suite and rebuild-check verification. |
| **Scribe** | 📜 | Sun 10:00 GMT+7 | Pending | ⏳ Scheduled | Synchronize documentation and update CHANGELOG. |

---

## 3. Active Blockers & Critical Findings

- **No critical blockers** currently preventing CI or handbook generation.
- **Coverage Gap Finding**: Examples for Decomposition Tree, Gauge, Waterfall, KPI, and Scatter are still missing. Manifest specification for these visuals has been outlined to unblock implementation.
- **UI Verification Pending**: New format-pane evidence remains unverified until live Desktop UI inspections are formally tracked against target build 2.150.5353.0.

---

## 4. Visual Catalog Coverage & Evidence Matrix

- **Pinned Build**: `2.150.5353.0` (January 2026 Report Server)
- **Manifests Tracked**:
  - `examples/sample-dashboard.json` (3 visuals: current Card, clustered bar, Matrix)
  - `examples/executive-sales-dashboard.json` (Multi-visual executive overview)
  - `examples/sales-scorecard.json` (9 visuals, conditional formatting, matrix)
  - `examples/university-of-melbourne.json` (Treemap, table, line, custom theme)
  - `examples/opportunity-analysis.json` (26 visuals, 4-quadrant layout, deuteranopia-accessible palette)

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
<summary>Sprint Closeout Summary (Folded by AI PM Manager) — 2026-10-19 to 2026-10-25</summary>

- Scribe agent run completed successfully.
- Added visual catalog mappings in `references/visuals/2.150.json` for Decomposition Tree (`decompositionTreeVisual`), Gauge (`gauge`), Waterfall (`waterfallChart`), KPI (`kpi`), and Scatter (`scatterChart`) to formally track them in the catalog.
- Verified README, AGENTS, and CONTRIBUTING documentation were up-to-date and completely accurate.
- `CHANGELOG.md` updated to reflect this week's commits, specifically auditing the CLI/CI pipeline (PR #15).
- Re-ran test, validate, audit, build, and rebuild-check steps successfully, resulting in a zero-drift clean sprint state.
- Plumber verified zero runtime dependencies. CLI pipeline executes successfully with correct error handling. Audited CI workflow and updated build step to use `npm run build`. Verified agent skill installation script. (2026-10-22)
- Radar passed all 17/17 tests. Rebuild-check passed zero drift. (2026-10-24)
</details>

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

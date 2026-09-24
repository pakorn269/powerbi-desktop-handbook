# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] — 2026-09-24

### Added

- Version-aware visual catalog resolving 45+ visuals from the pinned `2.150` theme schema and curated release evidence.
- 37-item visual gallery with a two-tone SVG palette organized by visual family (blue, violet, orange, magenta, green, amber, slate, plus R, Python, AI, scorecard, and paginated-report accents).
- Exact-build field-role evidence for 30 gallery visuals inspected in Desktop build `2.150.5353.0` (en-US, classic Visualizations pane).
- Seven modeled gallery entries explicitly marked pending (Azure Maps, Shape map, Key influencers, Q&A, Smart narrative, Scorecard, Paginated report visual).
- Backward-compatible legacy and structured field assignment normalization against exact-release Build-role evidence.
- CLI commands: `detect`, `catalog`, `lookup`, `validate`, `build`, and `model-contract`.
- Standalone, offline HTML handbook generator with Power BI Desktop-style interface.
- Shared web template with title bar, ribbon, section rail, report workspace, and Visualizations/Format/Data inspector panes.
- Global search, catalog filtering, visual gallery navigation, persistent checklists, responsive layouts, and print output.
- Build visual panel with gallery selection, field wells, and placement navigation.
- Format page panel with page information, canvas settings, canvas background, wallpaper, filter pane, and filter cards guidance.
- Semantic model contract extraction (`model-contract`) for integration with [powerbi-modeling-mcp](https://github.com/microsoft/powerbi-modeling-mcp).
- DAX field reference parsing supporting `Table[Column]`, `'Table Name'[Column]`, `[Measure]`, and `'Table'[Hierarchy].[Level]` notation.
- Manifest validation with page bounds, visual type resolution, field-assignment normalization, and format-setting schema assertions.
- Publication audit scanning for credentials, private keys, local paths, and configurable organization-specific blocklists.
- SHA-256 checksum verification for the pinned theme schema.
- GitHub Actions CI on Ubuntu and Windows with Node.js 20 and 22.
- Rebuild-check CI step to prevent drift between the generator and committed example HTML.
- JSON Schema for handbook manifests (`schemas/manifest.schema.json`).
- Interactive 2D canvas layout preview (`#preview`) with responsive aspect-ratio scaling to match report page settings (16:9, 4:3, or custom pixel dimensions).
- Dual preview modes: Realistic Mockup mode (styled cards with KPI values/sparklines, column/bar charts, donut charts with SVG arc slices, matrix tables, and line paths) and Blueprint wireframe mode with exact `[X, Y, W, H]` bounding boxes.
- Live layout adjuster enabling designers to select any visual and adjust X, Y, Width, and Height dimensions with real-time 2D canvas feedback.
- One-click manifest layout JSON export to clipboard for immediate synchronization back to manifest files before building in Power BI Desktop.
- Toggleable 40px alignment grid overlay for verifying margins and gutters.
- Bi-directional cross-navigation linking preview visuals to Visual Plan construction cards and Visual Gallery build roles.
- Executive Sales & Performance Dashboard template (`examples/executive-sales-dashboard.json`) and generated handbook (`examples/executive-sales-dashboard-guide.html`) with 7 visuals across multiple chart families.
- Executive Sales Scorecard reference dashboard (`examples/sales-scorecard.json`) and generated handbook (`examples/sales-scorecard-guide.html`) with 9 visuals: header title banner with conditional status indicators, vertical list slicers for customer segment and calendar year, clustered bar charts with unprofitable highlight bars, dual CY vs. PY trend lines with KPI growth deltas and monthly callouts, and profit & loss matrix with regional manager hierarchy, SVG territory maps, and negative value callouts.
- Custom Power BI Report Theme schema support (`schemas/manifest.schema.json`) with `dataColors`, `background`, `foreground`, and `tableAccent` configuration.
- University of Melbourne Theme reference dashboard (`examples/university-of-melbourne.json`), standalone theme file (`examples/university-of-melbourne.theme.json`), and generated handbook (`examples/university-of-melbourne-guide.html`) with 5 visuals: chromeless title banner, 19-row brand/color sales inventory table with navy headers and sticky totals, brand/class freight treemap, 3-series unit timeline (Deluxe, Economy, Regular), and 8-color subcategory clustered column chart.
- Opportunity Analysis Sample 4-quadrant reference dashboard (`examples/opportunity-analysis.json`), standalone Veterans Affairs accessible theme file (`examples/veterans-affairs.theme.json`), and generated handbook (`examples/opportunity-analysis-guide.html`) with 26 visuals in 4:3 canvas layout (1024 × 768 px).
- Colorblind and deuteranopia-accessible USWDS/VADS design system styling with Georgia serif titles, 3-slice regional pie charts with pointer lines, clustered column and bar charts, 100% stacked column stage breakdown, vertical checkbox list slicers, and revenue KPI cards.
- Dedicated canvas preview mockups for `treemap` (nested brand/class proportional rectangles), `tableEx` (styled tabular inventory with bold headers and sticky total row), multi-series `lineChart` with custom legend and smooth trend lines, and multi-colored `clusteredColumnChart` mapped to theme `dataColors`.
- Enhanced canvas preview engine with specialized pure-CSS and inline-SVG renderers for slicers, chromeless header banners, dual trend charts with KPI deltas, and regional hierarchy matrices.
- Blueprint wireframe mode field name resolution using normalized `displayFields(v)` to format structured role/field mappings cleanly without `[object Object]`.
- Sample manifest (`examples/sample-dashboard.json`) and generated handbook (`examples/sample-dashboard-guide.html`).
- Antigravity IDE plugin manifest (`plugins/powerbi-desktop-handbook/plugin.json`) and automated installation/uninstallation script (`scripts/install-antigravity.mjs`) supporting global and workspace discovery.
- `CONTRIBUTING.md` with evidence model documentation and development workflow.

[0.1.0]: https://github.com/pakorn269/powerbi-desktop-handbook/releases/tag/v0.1.0

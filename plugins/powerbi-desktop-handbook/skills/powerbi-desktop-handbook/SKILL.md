---
name: powerbi-desktop-handbook
description: Provide version-aware guidance for Power BI Desktop visuals and Format pane settings, including visual availability, legacy or renamed visuals, Report Server compatibility, schema-backed property lookup, interactive 2D canvas layout preview and pre-build template visualization, real-time spatial adjustment, and generation or validation of offline HTML build handbooks. Use when identifying visuals, translating visual names, checking exact-build support, documenting manual PBIX construction, previewing dashboard layouts, or building a visual setup guide. Do not use this skill to claim that Power BI Desktop RS supports PBIP/PBIR authoring or to modify PBIX report pages.
---

# Power BI Desktop Handbook

Use the bundled CLI and pinned evidence before answering questions about whether a visual or setting exists. Power BI visual names differ among the Insert gallery, internal report JSON, theme schema, documentation, and older releases.

## Workflow

1. Run `node scripts/handbook.mjs detect --json` to compare the installed Report Server Desktop executable with the target release.
2. Run `node scripts/handbook.mjs lookup --release 2.150.5353.0 --visual "<name>" --json` before giving visual-specific instructions.
3. State the evidence level: exact live UI, schema family, Microsoft documentation, or project observation.
4. For a build guide, author a manifest following `../../../examples/sample-dashboard.json`, `../../../examples/executive-sales-dashboard.json`, or `../../../examples/sales-scorecard.json`, using legacy or structured field assignments as appropriate; validate it, then build the standalone HTML file.
5. Open the generated handbook to review the **Canvas Preview** before authoring in Power BI Desktop. Verify visual proportions, test Mockup vs. Blueprint wireframe modes, check alignment with the 40px grid, and adjust visual positions or dimensions using the live layout adjuster. Export updated manifest JSON if adjustments are made.
6. Mark instructions as live-UI-pending unless the exact executable build has been inspected.

## Commands

```powershell
node scripts/handbook.mjs detect
node scripts/handbook.mjs catalog --release 2.150.5353.0
node scripts/handbook.mjs lookup --release 2.150.5353.0 --visual Matrix
node scripts/handbook.mjs validate --manifest dashboard.json
node scripts/handbook.mjs build --manifest dashboard.json --output dashboard-guide.html
node scripts/handbook.mjs model-contract --manifest dashboard.json
npm run install:antigravity
```

Append `--json` for machine-readable output.

## Power BI Modeling MCP compatibility

Use [@microsoft/powerbi-modeling-mcp](https://github.com/microsoft/powerbi-modeling-mcp) together with this skill for end-to-end report authoring:

- **Semantic model authoring (`powerbi-modeling-mcp`)**: Connects AI agents to Power BI Desktop, Fabric, or PBIP/TMDL models to create and validate tables, columns, DAX measures, and relationships. It explicitly cannot modify report pages or visual canvas elements.
- **Report visual guidance (`powerbi-desktop-handbook`)**: Validates visual types, exact-build field-well roles, Format pane properties, and builds offline construction guides.
- **Contract extraction**: Run `node scripts/handbook.mjs model-contract --manifest dashboard.json --json` to extract required tables, columns, and measures from the visual manifest, allowing agents using `powerbi-modeling-mcp` to ensure model objects exist before manual report assembly.

## Manifest field assignments

Existing role-prefixed strings remain valid:

```json
"fields": ["Y-axis: Team[Name]"]
```

Use structured assignments when field metadata is known:

```json
"fields": [
  {
    "role": "yAxis",
    "field": "Team[Name]",
    "kind": "column",
    "aggregation": null
  }
]
```

Supported kinds are `column`, `measure`, `hierarchy`, and `unknown`. The generator preserves the raw manifest, loads exact-release evidence into top-level `buildRoles`, and emits canonical `visuals[].fieldAssignments`. Unknown or incomplete role semantics warn rather than fail; malformed structured objects fail validation. Do not infer field kinds, aggregation, capacity, or requiredness when the manifest and curated evidence leave them unknown.

## Interactive canvas preview & pre-build layout adjustment

Generated handbooks provide a 2D canvas layout preview (`#preview`) so report designers and stakeholders can inspect dashboard templates and sample layouts before constructing them in Power BI Desktop:

- **Mockup Mode**: Renders KPI cards, bar/column charts with conditional formatting, donut charts, dual-line trend graphs with KPI growth headers and data callouts, vertical list checkbox slicers, chromeless title banners with status legends, and hierarchical matrices with SVG territory maps and negative value callouts.
- **Blueprint Mode**: Displays technical wireframes with exact coordinate bounding boxes `[X, Y, W, H]`, dimensions, visual type badges, and clean field role mappings.
- **Alignment Grid**: Toggleable 40px grid overlay for verifying margins, gutters, and alignment across rows and columns.
- **Live Layout Adjuster**: Select any visual on the canvas or via the picker to modify X, Y, Width, and Height inputs in real time, with instant 2D canvas repositioning.
- **Export Manifest JSON**: Copies the updated manifest layout directly to the clipboard, allowing changes to be reflected in manifest source files prior to PBIX report creation.
- **Direct Navigation**: Clicking any preview visual provides one-click navigation to its Visual Plan card (`go('visual-' + i)`) or Visual Gallery build-role reference (`selectGallery()`).

## Evidence model

- **Available** means curated evidence says the visual is expected in the Insert gallery for this release family.
- **Legacy hidden** means old report JSON may still contain the visual, but new reports should use its replacement.
- **Renamed** means the visible gallery label differs from the internal schema identifier, such as Matrix and `pivotTable`.
- **Schema present** proves only that the pinned schema defines the object; it does not prove gallery presence.
- **Exact live UI** means the stated label or field role was observed in the complete target build, locale, and interaction mode recorded under `references/build/`.
- **Build-role pending** means the modeled visual was not exposed as a direct icon during that inspection; it is not an unsupported claim.
- **Live UI pending** means the exact target build has not yet been opened and checked.

## Guardrails

- Target the complete build number. Schema-family compatibility is not exact-build certification.
- Distinguish current Card (`cardVisual`) from legacy Card (`card`) and Multi-row card (`multiRowCard`).
- Treat Matrix as the user-facing name for the `pivotTable` schema object.
- Power BI Desktop optimized for Report Server primarily saves PBIX. Do not promise PBIP/PBIR round-trip authoring in this edition.
- A generated handbook documents manual authoring; it does not directly edit the PBIX report canvas.

## References

- Release profiles: `references/releases/`
- Exact-build field-role evidence: `references/build/`
- Curated visual status: `references/visuals/`
- Format-pane guide mappings: `references/guides/`
- Pinned Microsoft schema: `references/schemas/`

# Build Visual Implementation Plan

## Goal

Make the handbook's **Build visual** pane resemble the classic Visualizations pane in Microsoft Power BI Desktop optimized for Power BI Report Server, January 2026, build `2.150.5353.0`.

The handbook remains a standalone, offline guide for manually constructing a report. It does not edit a PBIX canvas or claim PBIP/PBIR authoring support.

## Scope and status

| Phase | Deliverable | Status |
| --- | --- | --- |
| 0 | Colorful, Power BI-like visual gallery SVGs | Completed |
| 1 | Exact-build Build-role evidence | Completed |
| 2 | Backward-compatible generator and manifest contract | Completed |
| 3 | Desktop-style field wells | Planned |
| 4 | Interactive Report data pane | Planned |
| 5 | Complete visual-family coverage | Planned |
| 6 | Exact-UI fidelity review and hardening | Planned |

## Phase 0 — Visual gallery SVG palette

Apply recognizable Power BI-style color families while preserving the existing icon geometry and Desktop-like neutral application chrome.

- Blue (`#118DFF` / `#9ED0FF`): core bar and column charts.
- Violet (`#744EC2` / `#BDA9E5`): line and area charts.
- Orange (`#E66C37` / `#F2B092`): combo, ribbon, waterfall, and funnel charts.
- Magenta (`#E044A7` / `#F0A6D3`): scatter, pie, donut, and treemap charts.
- Green (`#1AAB40` / `#91D6A3`): map visuals.
- Amber (`#C58B00` / `#F0CF72`): gauge, current Card, and KPI visuals.
- Slate (`#52616F` / `#AEB8C1`): slicer, table, and Matrix visuals.
- R (`#276DC3` / `#9CC2ED`) and Python (`#3776AB` / `#FFD43B`).
- AI (`#6B5B95` / `#C0B5DA`) and scorecard or paginated report (`#008C95` / `#84D1D5`).
- Preserve hover, selected, focus, and used states.

Completion criteria:

- All 37 gallery icons use the curated palette.
- Every gallery identifier has exactly one primary/accent assignment, with no missing, duplicate, or extra selectors.
- The generated sample guide is rebuilt.
- Palette and gallery regression tests cover primary, accent, outline, hover, and selected behavior.

Status: completed and verified for the generated sample guide.

## Phase 1 — Build-role evidence for the exact Desktop release

The classic **Build visual** interface was inspected in the exact target executable and recorded in the release-specific curated reference:

`plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/references/build/2.150.5353.0.json`

For each gallery visual, record:

- Stable schema or catalog identifier.
- User-facing visual name.
- Visual family.
- Field roles in displayed order.
- Exact role label used by Desktop.
- Required or optional status.
- Single-value or multi-value capacity.
- Accepted field kinds, where verified.
- Default aggregation behavior, where verified.
- Evidence level and live-UI verification status.

The inspection started with three representative visuals:

1. Current Card (`cardVisual`).
2. Clustered bar chart.
3. Matrix (`pivotTable`).

It then covered every visual in the 37-item modeled gallery. The exact classic gallery exposed 36 icons; 30 correspond to modeled gallery entries and now have verified field-role labels and ordering. Seven modeled entries were not exposed as direct icons during the inspection and are explicitly pending rather than being marked unsupported: Azure Maps, Shape map, Key influencers, Q&A, Smart narrative, Scorecard, and Paginated report visual.

Current Card (`cardVisual`) was distinguished from legacy Card (`card`) by its visible wells: current Card exposes **Value**, **Categories**, and **Tooltips**, while legacy Card exposes **Fields**. Multi-row card (`multiRowCard`) remains a separate catalog object.

Requiredness, capacity, accepted field kinds, and default aggregation remain `unknown` where the live interface did not prove them. Local screenshots and the synthetic PBIX inspection fixture remain in the ignored `local/build-role-inspection/` directory; the publishable reference contains only the resulting non-sensitive evidence contract.

Completion criteria:

- Every gallery entry has an explicit role definition or an explicit unsupported/pending state.
- UI claims remain marked pending until the exact executable has been inspected.
- Role mappings are curated evidence; they are not inferred from the pinned theme schema.

Status: completed and contract-tested for exact build `2.150.5353.0`. Phase 2 now loads this reference into manifest validation and the generated handbook payload; Phase 1 itself introduced evidence without changing runtime behavior.

## Phase 2 — Generator and manifest contract

Add a structured field-assignment format while preserving existing manifests.

Existing syntax remains valid:

```json
"fields": ["Y-axis: Team[Name]"]
```

New structured syntax:

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

Implementation requirements:

- Normalize legacy strings and structured assignments in `handbook.mjs`.
- Preserve the raw manifest, add the complete release reference as `buildRoles`, and add normalized `fieldAssignments` to each enriched visual.
- Preserve backward compatibility for all existing manifests.
- Support `column`, `measure`, `hierarchy`, and `unknown` field kinds.
- Match role IDs and labels case- and punctuation-insensitively; assign unprefixed legacy strings to the first verified role when one exists.
- Escape every manifest, catalog, role, and field string before HTML insertion.
- Fail for malformed structured assignment shapes while keeping semantic completeness checks as warnings.
- Warn initially, rather than fail, for:
  - Unknown roles.
  - Assignments over a role's capacity.
  - Empty required roles.
  - Duplicate assignments.
- Keep incomplete manual guides valid.

Completion criteria:

- Legacy and structured field declarations produce equivalent normalized assignments.
- The sample manifest validates without requiring migration.
- Tests cover normalization, warnings, and escaping.

Status: completed. The sample manifest remains in legacy form and validates without migration; the generated payload now carries the exact-release Build-role reference and additive normalized assignments. Existing generic field displays and search consume the normalized contract, while empty Desktop-style wells and interactive editing remain Phase 3 and Phase 4 work.

## Phase 3 — Desktop-style field wells

Replace the generic field display with role-aware field wells driven by the selected visual.

Required behavior:

- Render every verified role in Desktop order, including empty roles.
- Show an empty-state prompt such as `Add data fields here`.
- Render assigned fields as compact tokens containing:
  - Field-kind icon.
  - Field name.
  - Aggregation or field menu affordance.
  - Remove and reorder affordances where applicable.
- Keep the selected visual and placement context visible.
- Preserve gallery states for selected, used, unused, focused, and empty visuals.
- Move technical catalog information to a secondary or collapsible area.
- Provide a reset action that restores manifest-defined assignments.

First acceptance set:

- Current Card.
- Clustered bar chart.
- Matrix.

Completion criteria:

- Those three visuals display their exact verified field-well structure.
- Empty, populated, overflow, and reset states work without layout clipping.
- Keyboard focus and reduced-motion behavior remain functional.

## Phase 4 — Interactive Report data pane

Turn the current Data area into a report-field tree derived from all fields referenced by the manifest.

Required behavior:

- Group fields by table and show field-kind icons.
- Use structured metadata when present; treat legacy strings as `unknown` where type cannot be established safely.
- Keep release and evidence metadata available in a separate collapsible handbook section.
- Allow fields to be added by click, keyboard, or drag and drop.
- Allow removal, reordering, and aggregation changes.
- When switching visual types:
  - Retain assignments only where role mapping is compatible.
  - Move incompatible assignments to a visible **Unassigned fields** tray.
  - Never discard a field silently.
- Keep interaction state session-only.
- Do not alter the manifest, PBIX file, or the existing `pbi-handbook:` checklist-storage contract.

Completion criteria:

- Mouse and keyboard users can add, remove, and reorder fields.
- Visual switching preserves or visibly parks every assignment.
- Reloading the guide restores manifest defaults while checklist persistence continues to work independently.

## Phase 5 — Complete visual-family coverage

Expand role definitions and UI behavior across these families:

- Cartesian charts.
- Part-to-whole and distribution charts.
- Maps.
- Cards, KPI, and gauge.
- Slicer.
- Table and Matrix.
- R and Python script visuals.
- AI visuals.
- Scorecard and paginated report visuals.

Cover specialized roles only when supported by evidence, including:

- Legend, tooltips, and small multiples.
- Play axis.
- Latitude, longitude, and location.
- Target and trend fields.
- Matrix rows, columns, and values.
- Script inputs.
- AI Explain or Analyze fields.

Completion criteria:

- Every supported gallery visual renders appropriate field wells.
- Unsupported or unverified behavior is clearly marked pending.
- No field well is invented solely to make the interface appear complete.

## Phase 6 — Fidelity review and hardening

Compare the generated guide directly with the exact target Power BI Desktop interface and refine:

- Gallery order, icon shape, label, and tooltip.
- Pane width, spacing, separators, scrolling, and overflow.
- Field-well labels and ordering.
- Token menus and aggregation labels.
- Hover, selected, disabled, focus, and drag states.
- Responsive and print layouts.

Automated coverage should include:

- All 37 gallery entries resolve to a role definition or pending state.
- Legacy and structured field normalization.
- Unknown-role, required-role, duplicate, and over-capacity warnings.
- Standalone offline generation and string escaping.
- Visual selection and keyboard gallery navigation.
- Add, remove, reorder, aggregation, visual switching, unassigned fields, and reset.
- Pane scrolling, responsive behavior, reduced motion, and print output.

Required verification:

```powershell
npm test
npm run validate
npm run audit:public
node plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/scripts/handbook.mjs detect --json
node plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/scripts/handbook.mjs lookup --release 2.150.5353.0 --visual Matrix --json
node plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/scripts/handbook.mjs model-contract --manifest examples/sample-dashboard.json --json
node plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/scripts/handbook.mjs build --manifest examples/sample-dashboard.json --output examples/sample-dashboard-guide.html --json
```

Open the result through `file://` and verify the gallery, field wells, interactions, search, filters, checklist persistence, responsive layout, scrolling, and print layout.

## Compatibility and design decisions

- Model the classic Visualizations-pane workflow. Do not mix it with the on-object interaction interface, which removes the Visualizations pane.
- Target the complete build `2.150.5353.0`; a compatible schema family is not exact-build certification.
- The installed build being detected does not itself certify that the live UI was inspected.
- The handbook documents manual report construction and does not edit PBIX content.
- Role definitions belong in a release-aware curated reference, not in CSS or hard-coded template markup.
- Manifest brand colors remain within report content; shared application chrome stays neutral and Desktop-like.
- Matrix is the user-facing name for the `pivotTable` schema object.
- Session-only Build visual state remains separate from checklist persistence.

## Suggested implementation sequence

1. `docs/reference: add build-role contract`
2. `feat(generator): normalize build field assignments`
3. `feat(shell): render Desktop-style field wells`
4. `feat(shell): add data-pane interactions`
5. `feat(reference): cover remaining visual families`
6. `test: harden build visual interactions`

Each phase should update behavioral tests and rebuild `examples/sample-dashboard-guide.html`; generated-file diffs alone are not sufficient verification.

## Evidence and references

Repository evidence:

- `plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/references/`
- `plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/scripts/handbook.mjs`
- `plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/assets/handbook-shell.html`
- `examples/sample-dashboard.json`

Microsoft documentation:

- [Power BI report visualizations](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-report-visualizations)
- [Power BI Modeling MCP Server](https://github.com/microsoft/powerbi-modeling-mcp)
- [On-object interaction](https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-on-object-interaction)
- [Customize visual tooltips](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-visual-tooltips)

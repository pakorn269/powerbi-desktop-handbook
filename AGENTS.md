# AGENTS.md

## Project purpose

This repository provides a version-aware Power BI Desktop visual catalog and a generator for standalone, offline report-building handbooks. The current release profile targets Microsoft Power BI Desktop optimized for Power BI Report Server, January 2026, build `2.150.5353.0`.

## Sources of truth

- `plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/scripts/handbook.mjs` owns catalog resolution, manifest validation, build detection, and HTML generation.
- `plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/assets/handbook-shell.html` is the shared Power BI Desktop-style web template.
- `plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/references/` contains pinned release, exact-build field-role, visual, guide, and schema evidence.
- A handbook manifest is the source of truth for report-specific content. Do not hand-edit a generated guide when the change belongs in its manifest or the shared template.
- `visuals[].fields` may mix legacy strings and structured `{ role, field, kind, aggregation }` assignments. Keep the raw manifest backward compatible; normalized assignments belong in generated `visuals[].fieldAssignments`, and the release contract belongs in top-level `buildRoles`.
- `examples/sample-dashboard-guide.html` is generated from `examples/sample-dashboard.json` and must be rebuilt after generator, template, or relevant reference changes.
- `examples/executive-sales-dashboard-guide.html` is generated from `examples/executive-sales-dashboard.json` and serves as a rich multi-visual template reference.
- `examples/sales-scorecard-guide.html` is generated from `examples/sales-scorecard.json` and models a 9-visual executive sales scorecard with conditional formatting and profit & loss matrix.
- `schemas/manifest.schema.json` is the formal JSON Schema for handbook manifests. Update it when the manifest contract changes.

## Required workflow

Use Node.js 20 or newer. The CLI has no runtime dependencies.

```powershell
npm test
npm run validate
npm run audit:public
npm run build
npm run rebuild-check
npm run detect
npm run handbook -- lookup --release 2.150.5353.0 --visual Matrix --json
npm run model-contract
```

When changing visual guidance:

1. Detect the installed Desktop build.
2. Look up every affected visual against the target release.
3. Edit the manifest, curated reference, generator, or shared shell that actually owns the behavior.
4. Validate the manifest and run the complete test suite.
5. Run the public-release audit before staging or publishing files.
6. Rebuild affected generated HTML files.
7. Open the result through `file://` and verify the interface, search, filters, checklist persistence, canvas layout preview (Mockup and Blueprint modes, layout adjuster), responsive behavior, and print layout.

## Evidence guardrails

- Always target a complete Desktop build number. Schema-family compatibility is not exact-build certification.
- Keep schema presence, expected gallery availability, Microsoft documentation, project observation, and exact live-UI verification distinct.
- Leave UI instructions marked pending unless the target executable's actual interface has been inspected.
- Treat `references/build/<complete-build>.json` as curated exact-live-UI evidence. Do not infer roles, capacity, requiredness, accepted kinds, or aggregation defaults from the theme schema.
- Matrix is the user-facing name for the `pivotTable` schema object.
- Keep current Card (`cardVisual`), legacy Card (`card`), and Multi-row card (`multiRowCard`) distinct.
- Power BI Desktop optimized for Report Server primarily saves PBIX. Do not claim PBIP/PBIR round-trip authoring support for this edition.
- A generated handbook documents manual report construction; it does not edit a PBIX canvas.
- When pairing with [powerbi-modeling-mcp](https://github.com/microsoft/powerbi-modeling-mcp), keep the division of concerns clear: `powerbi-modeling-mcp` owns the semantic model layer (tables, columns, measures, DAX, relationships, TMDL), while this project owns report-level visual cataloging, field-well mapping, format settings, and construction checklists. Use `model-contract` to extract required model objects from a handbook manifest.

## Web-template constraints

- Generated handbooks must remain single-file and usable offline. Do not add remote scripts, stylesheets, fonts, or image dependencies.
- Canvas preview must render using responsive pure CSS aspect-ratio and percentage positioning with SVG visual mocks; do not use external canvas libraries or CDN assets.
- Treat reference screenshots as design evidence, not runtime assets, unless a manifest explicitly embeds an approved image.
- Preserve manifest brand colors inside the report content while keeping the shared application chrome neutral and Desktop-like.
- Keep keyboard navigation, focus states, reduced-motion support, responsive layouts, and print output functional.
- Preserve the `pbi-handbook:` local-storage key format unless a migration is implemented and tested.
- Escape all manifest, catalog, Build-role, and normalized field strings before inserting them into generated HTML.

## Repository hygiene

- Keep private customer or operational manifests outside this public-ready repository.
- Store temporary private material only in ignored `private/`, `customer/`, `customers/`, or `local/` directories; do not force-add it.
- Organization-specific publication audit blocklists belong in ignored `local/audit-blocklist.json`, `private/audit-blocklist.json`, or the `PBI_AUDIT_BLOCKLIST` environment variable. Never commit private employer or project terms directly to repository tests.
- Do not edit the pinned schema without updating and verifying its SHA-256 value in the release profile.
- Add or update tests for behavioral changes. Generated-file diffs alone are not sufficient verification.
- Avoid unrelated formatting or mechanical rewrites, especially in the large pinned schema and generated HTML files.

# Contributing to Power BI Desktop Handbook

Thank you for considering a contribution. This document explains how to set up the project, understand the evidence model, and submit changes.

## Prerequisites

- **Node.js 20 or newer** — the project has zero runtime dependencies.
- **Power BI Desktop optimized for Report Server** — required only for live-UI evidence work, not for generator or template changes.

## Getting started

```powershell
git clone https://github.com/pakorn269/powerbi-desktop-handbook.git
cd powerbi-desktop-handbook
npm test
```

All 12 tests should pass in under a second. No `npm install` is required.

## Development workflow

Every change that affects the generator, template, reference files, or manifests must follow this sequence:

```powershell
npm test                # Unit and contract tests
npm run validate        # Manifest validation
npm run audit:public    # Sensitive-data publication audit
npm run build           # Rebuild the sample dashboard guide
npm run rebuild-check   # Verify committed HTML matches a fresh build
```

After rebuilding, open `examples/sample-dashboard-guide.html` through `file://` and verify:

- Global search, catalog filters, and visual navigation
- Checklist persistence across page reloads
- 2D Canvas preview (Mockup and Blueprint modes, alignment grid overlay, and layout adjuster)
- Gallery selection, field wells, and format pane behavior
- Responsive layout on narrow viewports
- Print output (Ctrl+P)

## Project structure

```text
examples/                       Publishable manifests and generated examples
plugins/powerbi-desktop-handbook/
  skills/powerbi-desktop-handbook/
    assets/handbook-shell.html  Shared offline interface template
    references/                 Release, build-role, visual, guide, and schema evidence
    scripts/handbook.mjs        CLI entrypoint and generator
schemas/                        JSON Schema for manifests
test/                           Node.js test suite and CI scripts
```

## Understanding the evidence model

This project deliberately keeps different kinds of evidence separate:

| Evidence state | Meaning |
| --- | --- |
| Available | Curated evidence expects the visual in the Insert gallery for the release family. |
| Schema present | The pinned schema defines the object; gallery presence is not proven. |
| Live UI pending | The exact target interface has not yet been inspected. |
| Exact live UI | The claim was observed in the actual Desktop build. |

**Key rules:**

- **Do not infer** role definitions, capacity, requiredness, or aggregation defaults from the pinned theme schema. These belong in the curated `references/build/` evidence.
- **Do not claim** a visual is available just because the schema includes it.
- Installation detection is not UI certification. A matching executable proves the build is present, but field-role labels remain pending until the actual interface is checked.

## Adding support for a new Desktop release

1. Obtain the exact build number from the executable's `FileVersion`.
2. Create a new release profile in `references/releases/`.
3. Pin the theme schema and record its SHA-256 checksum.
4. Create a visual catalog override in `references/visuals/`.
5. Inspect the live Desktop UI and record build-role evidence in `references/build/`.
6. Update the default version in `handbook.mjs` if this becomes the primary target.
7. Add tests for the new release and ensure all existing tests still pass.

## Manifest authoring

See `examples/sample-dashboard.json` (3 visuals) and `examples/executive-sales-dashboard.json` (7 visuals across cards, donut, combo, matrix, and bar charts) for working examples. The manifest supports:

- **Legacy string fields**: `"Y-axis: Team[Name]"`
- **Structured field assignments**: `{ "role": "yAxis", "field": "Team[Name]", "kind": "column" }`

Both forms are normalized by the generator. Use `schemas/manifest.schema.json` for IDE autocomplete:

```json
{
  "$schema": "./schemas/manifest.schema.json",
  "title": "My Report",
  "release": "2.150.5353.0",
  ...
}
```

## Private and customer data

- **Never** commit customer-specific manifests, organizational names, or internal data to this repository.
- Store private material in `.gitignore`-protected directories: `private/`, `customer/`, `customers/`, or `local/`.
- Custom publication audit blocklists go in `local/audit-blocklist.json` or `private/audit-blocklist.json`.
- The `npm run audit:public` step will catch most accidental leaks.

## Submitting changes

1. Fork the repository and create a feature branch.
2. Make your changes and follow the development workflow above.
3. Add or update tests for behavioral changes — generated-file diffs alone are not sufficient verification.
4. Avoid unrelated formatting or mechanical rewrites, especially in the large pinned schema and generated HTML files.
5. Open a pull request with a clear description of what changed and why.

## Code style

- The generator (`handbook.mjs`) uses modern ES modules with `import`/`export`.
- The template (`handbook-shell.html`) is a single self-contained file with inline CSS and JavaScript.
- Keep the template offline-compatible: no remote scripts, stylesheets, fonts, or image dependencies.
- Escape all manifest, catalog, and field strings before inserting them into generated HTML.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogCache = new Map();
const buildRoleCache = new Map();
const fieldKinds = new Set(['column', 'measure', 'hierarchy', 'unknown']);

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const clean = value => String(value ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
const refName = ref => ref?.startsWith('#/definitions/') ? decodeURIComponent(ref.slice(14)) : null;

/**
 * Resolve filesystem paths for a given release profile.
 * @param {string} version - Desktop build number (e.g., '2.150.5353.0').
 * @returns {{ release: object, releaseFile: string, schemaFile: string, visualFile: string, guideFile: string, buildFile: string }}
 */
export function pathsForRelease(version = '2.150.5353.0') {
  const releaseFile = path.join(skillRoot, 'references', 'releases', `${version}.json`);
  if (!fs.existsSync(releaseFile)) throw new Error(`Unknown release profile: ${version}`);
  const release = readJson(releaseFile);
  return {
    release,
    releaseFile,
    schemaFile: path.resolve(path.dirname(releaseFile), release.schema.file),
    visualFile: path.join(skillRoot, 'references', 'visuals', `${release.schemaFamily}.json`),
    guideFile: path.join(skillRoot, 'references', 'guides', `${version}.json`),
    buildFile: path.join(skillRoot, 'references', 'build', `${version}.json`)
  };
}

/**
 * Load the curated exact-build field-role evidence for a release.
 * @param {string} version - Desktop build number.
 * @returns {{ release: string, capture: object, visuals: Array<object> }}
 */
export function loadBuildRoles(version = '2.150.5353.0') {
  if (buildRoleCache.has(version)) return buildRoleCache.get(version);
  const { buildFile } = pathsForRelease(version);
  if (!fs.existsSync(buildFile)) throw new Error(`Missing build-role reference for release ${version}: ${buildFile}`);
  const reference = readJson(buildFile);
  if (reference.release !== version) throw new Error(`Build-role reference release '${reference.release}' does not match ${version}.`);
  if (!Array.isArray(reference.visuals)) throw new Error(`Build-role reference for ${version} must contain a visuals array.`);
  buildRoleCache.set(version, reference);
  return reference;
}

/**
 * Verify the pinned theme schema's SHA-256 checksum.
 * @param {string} version - Desktop build number.
 * @returns {{ ok: boolean, expected: string, actual: string, file: string }}
 */
export function verifySchema(version = '2.150.5353.0') {
  const p = pathsForRelease(version);
  const bytes = fs.readFileSync(p.schemaFile);
  const actual = crypto.createHash('sha256').update(bytes).digest('hex');
  return { ok: actual === p.release.schema.sha256, expected: p.release.schema.sha256, actual, file: p.schemaFile };
}

function mergeNode(node, definitions, seen = new Set()) {
  if (!node || typeof node !== 'object') return {};
  let result = {};
  const name = refName(node.$ref);
  if (name && !seen.has(name)) {
    seen.add(name);
    result = mergeNode(definitions[name], definitions, seen);
  }
  for (const part of node.allOf ?? []) result = mergeObjects(result, mergeNode(part, definitions, new Set(seen)));
  result = mergeObjects(result, node);
  return result;
}

function mergeObjects(a, b) {
  const out = { ...a };
  for (const [key, value] of Object.entries(b ?? {})) {
    if (key === 'allOf' || key === '$ref') continue;
    out[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? mergeObjects(out[key] && typeof out[key] === 'object' ? out[key] : {}, value)
      : value;
  }
  return out;
}

function typeLabel(property) {
  if (property.type) return Array.isArray(property.type) ? property.type.join(' | ') : property.type;
  const name = refName(property.$ref);
  return name ?? (property.oneOf ? 'choice' : 'value');
}

function formattingFromDefinition(definition, definitions) {
  const resolved = mergeNode(definition, definitions);
  const cards = [];
  for (const [objectName, raw] of Object.entries(resolved.properties ?? {})) {
    const object = mergeNode(raw, definitions);
    const item = mergeNode(object.items ?? object, definitions);
    const props = Object.entries(item.properties ?? {}).map(([name, value]) => ({
      name,
      title: value.title ?? name,
      type: typeLabel(value),
      description: value.description ?? '',
      choices: (value.oneOf ?? value.enum ?? []).map(v => typeof v === 'object' ? (v.title ?? v.const) : v).filter(Boolean)
    }));
    if (props.length) cards.push({ name: objectName, title: raw.title ?? objectName, properties: props });
  }
  return cards.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Build the release-aware visual catalog from the pinned schema and curated overrides.
 * @param {string} version - Desktop build number.
 * @returns {{ release: object, schemaCheck: object, statuses: object, count: number, gallery: Array<object>, visuals: Array<object> }}
 */
export function buildCatalog(version = '2.150.5353.0') {
  if (catalogCache.has(version)) return catalogCache.get(version);
  const p = pathsForRelease(version);
  const schemaCheck = verifySchema(version);
  if (!schemaCheck.ok) throw new Error(`Pinned schema checksum mismatch: ${schemaCheck.actual}`);
  const schema = readJson(p.schemaFile);
  const curated = readJson(p.visualFile);
  const overrides = new Map(curated.visuals.map(item => [item.id, item]));
  const visualNames = Object.keys(schema.definitions ?? {}).filter(name => name.startsWith('visual-'));
  const visuals = visualNames.map(name => {
    const id = name.slice(7);
    const override = overrides.get(id) ?? {};
    return {
      id,
      label: override.label ?? id.replace(/([a-z])([A-Z])/g, '$1 $2'),
      aliases: override.aliases ?? [],
      status: override.status ?? 'schema-present',
      replacement: override.replacement ?? null,
      replacementFor: override.replacementFor ?? [],
      evidence: override.evidence ?? [`${p.release.schemaFamily} theme schema`],
      liveUi: override.liveUi ?? 'pending',
      formatting: formattingFromDefinition(schema.definitions[name], schema.definitions)
    };
  });
  for (const item of curated.visuals) {
    if (!visuals.some(v => v.id === item.id)) visuals.push({ ...item, formatting: [] });
  }
  visuals.sort((a, b) => a.label.localeCompare(b.label));
  const gallery = (curated.gallery ?? []).map(item => {
    const visual = visuals.find(candidate => candidate.id === item.id);
    if (!visual) throw new Error(`Gallery visual '${item.id}' is not in the pinned schema or curated catalog.`);
    return { ...item, status: visual.status, liveUi: visual.liveUi, evidence: visual.evidence };
  });
  const catalog = { release: p.release, schemaCheck, statuses: curated.statuses, count: visuals.length, gallery, visuals };
  catalogCache.set(version, catalog);
  return catalog;
}

/**
 * Resolve a visual by ID, label, or alias from a catalog.
 * @param {object} catalog - Catalog returned by buildCatalog().
 * @param {string} query - Gallery label, alias, or internal identifier.
 * @returns {object|null} Resolved visual entry, or null if not found.
 */
export function resolveVisual(catalog, query) {
  const q = clean(query);
  return catalog.visuals.find(v => clean(v.id) === q)
    ?? catalog.visuals.find(v => [v.label, ...(v.aliases ?? [])].some(name => clean(name) === q))
    ?? null;
}

/**
 * Detect the locally installed Power BI Desktop executable and compare with a target release.
 * @param {string} version - Target build number.
 * @returns {{ target: string, executable: string, installed: string|null, compatibility: string, exact: boolean }}
 */
export function detectRelease(version = '2.150.5353.0') {
  const { release } = pathsForRelease(version);
  const executable = release.defaultExecutable;
  if (process.platform !== 'win32' || !fs.existsSync(executable)) {
    return { target: version, executable, installed: null, compatibility: 'not-installed', exact: false };
  }
  const escaped = executable.replace(/'/g, "''");
  let installed = null;
  try {
    installed = execFileSync('powershell.exe', ['-NoProfile', '-Command', `(Get-Item -LiteralPath '${escaped}').VersionInfo.FileVersion`], { encoding: 'utf8' }).trim().split(/[\s+]/)[0];
  } catch { /* reported as unreadable */ }
  const exact = installed === version;
  const sameFamily = installed?.split('.').slice(0, 2).join('.') === release.schemaFamily;
  return { target: version, executable, installed, compatibility: exact ? 'exact' : sameFamily ? 'schema-family' : installed ? 'mismatch' : 'unreadable', exact };
}

/**
 * Normalize legacy strings and structured field assignments against a build-role reference.
 * @param {Array<string|object>} fields - Raw field declarations from a manifest visual.
 * @param {object|null} buildRole - Build-role entry for this visual, or null.
 * @param {string} source - Source path for error/warning messages.
 * @returns {{ assignments: Array<{role: string|null, field: string, kind: string, aggregation: string|null}>, errors: string[], warnings: string[] }}
 */
export function normalizeFieldAssignments(fields, buildRole = null, source = 'fields') {
  const assignments = [], errors = [], warnings = [];
  if (fields === undefined) fields = [];
  if (!Array.isArray(fields)) return { assignments, errors: [`${source} must be an array.`], warnings };

  const roles = Array.isArray(buildRole?.roles) ? [...buildRole.roles].sort((a, b) => a.order - b.order) : [];
  const rolesByKey = new Map();
  for (const role of roles) {
    rolesByKey.set(clean(role.id), role);
    rolesByKey.set(clean(role.label), role);
  }
  const matchRole = value => rolesByKey.get(clean(value)) ?? null;

  for (const [index, value] of fields.entries()) {
    const itemSource = `${source}[${index}]`;
    let role = null, matchedRole = null, field, kind = 'unknown', aggregation = null, explicitRole = false;

    if (typeof value === 'string') {
      const raw = value.trim();
      if (!raw) {
        errors.push(`${itemSource} must not be empty.`);
        continue;
      }
      const colon = raw.indexOf(':');
      if (colon > 0) {
        const roleValue = raw.slice(0, colon).trim();
        field = raw.slice(colon + 1).trim();
        explicitRole = true;
        if (!field) {
          errors.push(`${itemSource} must include a field after the role prefix.`);
          continue;
        }
        matchedRole = matchRole(roleValue);
        role = matchedRole?.id ?? roleValue;
      } else {
        field = raw;
        if (buildRole?.verification === 'verified' && roles.length) {
          matchedRole = roles[0];
          role = matchedRole.id;
        }
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      const errorCount = errors.length;
      if (typeof value.role !== 'string' || !value.role.trim()) errors.push(`${itemSource}.role must be a non-empty string.`);
      if (typeof value.field !== 'string' || !value.field.trim()) errors.push(`${itemSource}.field must be a non-empty string.`);
      if (value.kind !== undefined && (typeof value.kind !== 'string' || !fieldKinds.has(value.kind))) {
        errors.push(`${itemSource}.kind must be one of column, measure, hierarchy, or unknown.`);
      } else if (value.kind !== undefined) kind = value.kind;
      if (value.aggregation !== undefined && value.aggregation !== null && typeof value.aggregation !== 'string') {
        errors.push(`${itemSource}.aggregation must be a string or null.`);
      } else if (typeof value.aggregation === 'string') aggregation = value.aggregation.trim() || null;
      if (errors.length > errorCount) continue;
      explicitRole = true;
      field = value.field.trim();
      matchedRole = matchRole(value.role);
      role = matchedRole?.id ?? value.role.trim();
    } else {
      errors.push(`${itemSource} must be a legacy string or structured field assignment.`);
      continue;
    }

    if (!matchedRole) {
      warnings.push(explicitRole
        ? `${itemSource}.role '${role}' is not defined for visual '${buildRole?.id ?? 'unknown'}'.`
        : `${itemSource} could not infer a verified build role for visual '${buildRole?.id ?? 'unknown'}'.`);
    }
    assignments.push({ role, field, kind, aggregation });
  }

  const seen = new Map();
  for (const [index, assignment] of assignments.entries()) {
    const key = [assignment.role ?? '', assignment.field, assignment.kind, assignment.aggregation ?? '']
      .map(value => value.toLowerCase()).join('\u0000');
    if (seen.has(key)) warnings.push(`${source}[${index}] duplicates ${source}[${seen.get(key)}].`);
    else seen.set(key, index);
  }

  for (const role of roles) {
    const count = assignments.filter(assignment => assignment.role === role.id).length;
    if (role.capacity === 'single' && count > 1) warnings.push(`${source} assigns ${count} fields to single-capacity role '${role.id}'.`);
    if (role.required === 'required' && count === 0) warnings.push(`${source} leaves required role '${role.id}' empty.`);
  }
  return { assignments, errors, warnings };
}

/**
 * Validate a handbook manifest against the target release catalog and build-role evidence.
 * @param {object} manifest - Parsed manifest JSON.
 * @param {string} source - File path or label for error messages.
 * @returns {{ ok: boolean, source: string, errors: string[], warnings: string[] }}
 */
export function validateManifest(manifest, source = '<memory>') {
  const errors = [], warnings = [];
  const need = (condition, message) => { if (!condition) errors.push(message); };
  need(manifest && typeof manifest === 'object', 'Manifest must be a JSON object.');
  if (!manifest || typeof manifest !== 'object') return { ok: false, source, errors, warnings };
  need(typeof manifest.title === 'string' && manifest.title.trim(), 'title is required.');
  need(typeof manifest.release === 'string', 'release is required.');
  need(Number.isFinite(manifest.page?.width) && Number.isFinite(manifest.page?.height), 'page.width and page.height must be numbers.');
  need(Array.isArray(manifest.visuals), 'visuals must be an array.');
  let catalog, buildRoles;
  try { catalog = buildCatalog(manifest.release); } catch (error) { errors.push(error.message); }
  try { buildRoles = loadBuildRoles(manifest.release); } catch (error) { errors.push(error.message); }
  const buildRolesById = new Map((buildRoles?.visuals ?? []).map(visual => [visual.id, visual]));
  const ids = new Set();
  for (const [index, visual] of (manifest.visuals ?? []).entries()) {
    const tag = `visuals[${index}]`;
    need(typeof visual.id === 'string' && visual.id, `${tag}.id is required.`);
    if (ids.has(visual.id)) errors.push(`${tag}.id duplicates ${visual.id}.`); else ids.add(visual.id);
    const resolved = catalog && resolveVisual(catalog, visual.type);
    if (!resolved) errors.push(`${tag}.type '${visual.type}' is not in the release catalog.`);
    const fieldValidation = normalizeFieldAssignments(visual.fields, buildRolesById.get(resolved?.id), `${tag}.fields`);
    errors.push(...fieldValidation.errors);
    warnings.push(...fieldValidation.warnings);
    const p = visual.position;
    if (!p || !['x', 'y', 'width', 'height'].every(k => Number.isFinite(p[k]))) errors.push(`${tag}.position requires numeric x, y, width, and height.`);
    else if (p.x < 0 || p.y < 0 || p.width <= 0 || p.height <= 0 || p.x + p.width > manifest.page.width || p.y + p.height > manifest.page.height) errors.push(`${tag}.position exceeds the page bounds.`);
    for (const [sIndex, setting] of (visual.settings ?? []).entries()) {
      if (!setting.path || !setting.label || setting.value === undefined) errors.push(`${tag}.settings[${sIndex}] requires path, label, and value.`);
      if (setting.schemaObject || setting.schemaProperty) {
        if (!(setting.schemaObject && setting.schemaProperty)) errors.push(`${tag}.settings[${sIndex}] must provide both schemaObject and schemaProperty.`);
        else if (resolved) {
          const card = resolved.formatting.find(c => c.name === setting.schemaObject);
          if (!card) errors.push(`${tag}.settings[${sIndex}] schema object '${setting.schemaObject}' was not found.`);
          else if (!card.properties.some(p => p.name === setting.schemaProperty)) errors.push(`${tag}.settings[${sIndex}] schema property '${setting.schemaProperty}' was not found.`);
        }
      } else warnings.push(`${tag}.settings[${sIndex}] is a UI instruction without a schema-property assertion.`);
    }
  }
  return { ok: errors.length === 0, source, errors, warnings };
}

function enrichedData(manifest) {
  const catalog = buildCatalog(manifest.release);
  const buildRoles = loadBuildRoles(manifest.release);
  const buildRolesById = new Map(buildRoles.visuals.map(visual => [visual.id, visual]));
  const guidePath = pathsForRelease(manifest.release).guideFile;
  const guide = fs.existsSync(guidePath) ? readJson(guidePath) : { entries: {} };
  const { file: _localSchemaPath, ...publicSchemaCheck } = catalog.schemaCheck;
  return {
    generatedAt: new Date().toISOString(),
    manifest,
    release: catalog.release,
    schemaCheck: publicSchemaCheck,
    statuses: catalog.statuses,
    catalog: catalog.visuals,
    gallery: catalog.gallery,
    buildRoles,
    pageGuide: guide.entries.page ?? { formatRoot: 'Format page', sections: [] },
    visuals: manifest.visuals.map(v => {
      const resolved = resolveVisual(catalog, v.type);
      const fieldAssignments = normalizeFieldAssignments(v.fields, buildRolesById.get(resolved?.id)).assignments;
      return { ...v, fieldAssignments, catalog: resolved, guide: guide.entries[resolved?.id] ?? {} };
    })
  };
}

/**
 * Serialize a value to JSON with HTML-sensitive characters escaped for safe embedding in a script tag.
 * @param {*} value - Value to serialize.
 * @returns {string} JSON string with <, >, &, U+2028, and U+2029 escaped.
 */
export function serializeForHtmlData(value) {
  const replacements = { '<': '\\u003c', '>': '\\u003e', '&': '\\u0026', '\u2028': '\\u2028', '\u2029': '\\u2029' };
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, character => replacements[character]);
}

/**
 * Validate a manifest and generate a standalone HTML handbook.
 * @param {string} manifestFile - Path to the manifest JSON file.
 * @param {string} outputFile - Destination path for the generated HTML.
 * @returns {{ ok: boolean, output: string, warnings: string[], visuals: number }}
 */
export function buildHandbook(manifestFile, outputFile) {
  const source = path.resolve(manifestFile);
  const manifest = readJson(source);
  const validation = validateManifest(manifest, source);
  if (!validation.ok) throw new Error(validation.errors.join('\n'));
  const template = fs.readFileSync(path.join(skillRoot, 'assets', 'handbook-shell.html'), 'utf8');
  const payload = serializeForHtmlData(enrichedData(manifest));
  const destination = path.resolve(outputFile);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, template.replace('__HANDBOOK_DATA__', payload), 'utf8');
  return { ok: true, output: destination, warnings: validation.warnings, visuals: manifest.visuals.length };
}

/**
 * Parse a DAX field reference into its components.
 * Supports Table[Column], 'Table Name'[Column], [Measure], and 'Table'[Hierarchy].[Level] notation.
 * @param {string} rawField - Raw field reference string.
 * @returns {{ table: string|null, name: string, expression: string, isMeasure: boolean, isHierarchy?: boolean }|null}
 */
export function parseFieldReference(rawField) {
  if (typeof rawField !== 'string') return null;
  const trimmed = rawField.trim();
  if (!trimmed) return null;

  // Unscoped DAX measure syntax: [Measure Name]
  const unscopedMatch = trimmed.match(/^\[([^\]]+)\]$/);
  if (unscopedMatch) {
    return {
      table: null,
      name: unscopedMatch[1],
      expression: trimmed,
      isMeasure: true
    };
  }

  // Table-scoped syntax: Table[Column] or 'Table Name'[Column]
  const tableScopedMatch = trimmed.match(/^(?:'([^']+)'|([A-Za-z0-9_]+))\[([^\]]+)\]$/);
  if (tableScopedMatch) {
    const table = tableScopedMatch[1] ?? tableScopedMatch[2];
    const name = tableScopedMatch[3];
    const isExplicitMeasureTable = ['measures', '_measures', 'measure'].includes(table.toLowerCase());
    return {
      table,
      name,
      expression: `${table}[${name}]`,
      isMeasure: isExplicitMeasureTable
    };
  }

  // Hierarchy notation: Table[Hierarchy].[Level] or 'Table'[Hierarchy].[Level]
  const hierarchyMatch = trimmed.match(/^(?:'([^']+)'|([A-Za-z0-9_]+))\[([^\]]+)\]\.\[([^\]]+)\]$/);
  if (hierarchyMatch) {
    const table = hierarchyMatch[1] ?? hierarchyMatch[2];
    const hierarchy = hierarchyMatch[3];
    const level = hierarchyMatch[4];
    return {
      table,
      name: `${hierarchy}.${level}`,
      expression: `${table}[${hierarchy}].[${level}]`,
      isMeasure: false,
      isHierarchy: true
    };
  }

  return {
    table: null,
    name: trimmed,
    expression: trimmed,
    isMeasure: false
  };
}

/**
 * Extract semantic model requirements (tables, columns, measures) from a manifest.
 * Used for integration with powerbi-modeling-mcp.
 * @param {object} manifest - Parsed manifest JSON.
 * @param {string} source - File path or label for error messages.
 * @returns {{ manifestId: string|null, manifestTitle: string|null, release: string|null, tables: string[], columns: string[], measures: string[], fields: Array<object> }}
 */
export function extractModelRequirements(manifest, source = '<memory>') {
  if (!manifest || typeof manifest !== 'object') throw new Error('Manifest must be a JSON object.');
  const catalog = buildCatalog(manifest.release ?? '2.150.5353.0');
  const buildRoles = loadBuildRoles(manifest.release ?? '2.150.5353.0');
  const buildRolesById = new Map(buildRoles.visuals.map(visual => [visual.id, visual]));

  const tables = new Set();
  const columns = new Set();
  const measures = new Set();
  const fieldsMap = new Map();

  for (const [vIndex, visual] of (manifest.visuals ?? []).entries()) {
    const resolved = resolveVisual(catalog, visual.type);
    const normalized = normalizeFieldAssignments(visual.fields, buildRolesById.get(resolved?.id), `visuals[${vIndex}].fields`);

    for (const assignment of normalized.assignments) {
      const parsed = parseFieldReference(assignment.field);
      const fieldKey = assignment.field;

      if (!fieldsMap.has(fieldKey)) {
        fieldsMap.set(fieldKey, {
          field: assignment.field,
          table: parsed?.table ?? null,
          name: parsed?.name ?? assignment.field,
          kind: assignment.kind !== 'unknown'
            ? assignment.kind
            : parsed?.isMeasure
              ? 'measure'
              : parsed?.table
                ? 'column'
                : 'unknown',
          visuals: []
        });
      }

      const entry = fieldsMap.get(fieldKey);
      entry.visuals.push({
        visualId: visual.id,
        visualType: visual.type,
        role: assignment.role
      });

      if (parsed?.table) {
        tables.add(parsed.table);
      }

      if (entry.kind === 'measure' || parsed?.isMeasure) {
        measures.add(assignment.field);
      } else if (entry.kind === 'column' || parsed?.table) {
        columns.add(assignment.field);
      }
    }
  }

  return {
    manifestId: manifest.id ?? null,
    manifestTitle: manifest.title ?? null,
    release: manifest.release ?? null,
    tables: [...tables].sort((a, b) => a.localeCompare(b)),
    columns: [...columns].sort((a, b) => a.localeCompare(b)),
    measures: [...measures].sort((a, b) => a.localeCompare(b)),
    fields: [...fieldsMap.values()]
  };
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) args._.push(argv[i]);
    else {
      const key = argv[i].slice(2);
      if (key === 'json') args.json = true;
      else args[key] = argv[++i];
    }
  }
  return args;
}

function print(value, json) {
  if (json) console.log(JSON.stringify(value, null, 2));
  else if (typeof value === 'string') console.log(value);
  else console.log(JSON.stringify(value, null, 2));
}

async function main(argv) {
  const args = parseArgs(argv), command = args._[0], release = args.release ?? '2.150.5353.0';
  if (!command || command === 'help' || args.help) return print(`Power BI Desktop Handbook\n\nCommands:\n  detect [--release VERSION]\n  catalog [--release VERSION] [--json]\n  lookup --visual NAME [--release VERSION] [--json]\n  validate --manifest FILE [--json]\n  build --manifest FILE --output FILE [--json]\n  model-contract --manifest FILE [--json]`, false);
  if (command === 'detect') return print(detectRelease(release), args.json);
  if (command === 'catalog') {
    const catalog = buildCatalog(release);
    const byStatus = catalog.visuals.reduce((counts, visual) => { counts[visual.status] = (counts[visual.status] ?? 0) + 1; return counts; }, {});
    return print(args.json ? catalog : { release, count: catalog.count, byStatus, visuals: catalog.visuals.map(v => `${v.label} [${v.id}] — ${v.status}`) }, args.json);
  }
  if (command === 'lookup') {
    if (!args.visual) throw new Error('--visual is required.');
    const result = resolveVisual(buildCatalog(release), args.visual);
    if (!result) throw new Error(`Visual not found: ${args.visual}`);
    return print(result, args.json);
  }
  if (command === 'validate') {
    if (!args.manifest) throw new Error('--manifest is required.');
    const file = path.resolve(args.manifest), result = validateManifest(readJson(file), file);
    print(result, args.json);
    if (!result.ok) process.exitCode = 1;
    return;
  }
  if (command === 'build') {
    if (!args.manifest || !args.output) throw new Error('--manifest and --output are required.');
    return print(buildHandbook(args.manifest, args.output), args.json);
  }
  if (command === 'model-contract') {
    if (!args.manifest) throw new Error('--manifest is required.');
    const file = path.resolve(args.manifest), result = extractModelRequirements(readJson(file), file);
    if (args.json) return print(result, true);
    const summary = [
      `Semantic Model Contract: ${result.manifestTitle ?? result.manifestId ?? 'Report'}`,
      `Target Release: ${result.release ?? 'unspecified'}`,
      '',
      `Required Tables (${result.tables.length}):`,
      ...(result.tables.length ? result.tables.map(t => `  - ${t}`) : ['  (none)']),
      '',
      `Required Columns (${result.columns.length}):`,
      ...(result.columns.length ? result.columns.map(c => `  - ${c}`) : ['  (none)']),
      '',
      `Required Measures (${result.measures.length}):`,
      ...(result.measures.length ? result.measures.map(m => `  - ${m}`) : ['  (none)']),
      '',
      `Visual Field Mappings (${result.fields.length}):`,
      ...result.fields.map(f => `  - ${f.field} [${f.kind}] -> ${f.visuals.map(v => `${v.visualId}.${v.role}`).join(', ')}`)
    ].join('\n');
    return print(summary, false);
  }
  throw new Error(`Unknown command: ${command}`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { console.error(`Error: ${error.message}`); process.exitCode = 1; });
}

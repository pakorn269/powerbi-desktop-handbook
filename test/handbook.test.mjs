import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildCatalog,
  buildHandbook,
  detectRelease,
  loadBuildRoles,
  normalizeFieldAssignments,
  resolveVisual,
  serializeForHtmlData,
  validateManifest,
  verifySchema
} from '../plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/scripts/handbook.mjs';

const root = path.resolve(import.meta.dirname, '..');
const sample = JSON.parse(fs.readFileSync(path.join(root, 'examples', 'sample-dashboard.json'), 'utf8'));
const buildRoleReference = JSON.parse(fs.readFileSync(path.join(
  root,
  'plugins',
  'powerbi-desktop-handbook',
  'skills',
  'powerbi-desktop-handbook',
  'references',
  'build',
  '2.150.5353.0.json'
), 'utf8'));
const expectedGalleryPalette = Object.fromEntries([
  [['barChart', 'columnChart', 'clusteredBarChart', 'clusteredColumnChart', 'hundredPercentStackedBarChart', 'hundredPercentStackedColumnChart'], ['#118dff', '#9ed0ff']],
  [['lineChart', 'areaChart', 'stackedAreaChart', 'hundredPercentStackedAreaChart'], ['#744ec2', '#bda9e5']],
  [['lineStackedColumnComboChart', 'lineClusteredColumnComboChart', 'ribbonChart', 'waterfallChart', 'funnel'], ['#e66c37', '#f2b092']],
  [['scatterChart', 'pieChart', 'donutChart', 'treemap'], ['#e044a7', '#f0a6d3']],
  [['map', 'filledMap', 'azureMap', 'shapeMap'], ['#1aab40', '#91d6a3']],
  [['gauge', 'cardVisual', 'kpi'], ['#c58b00', '#f0cf72']],
  [['slicer', 'tableEx', 'pivotTable'], ['#52616f', '#aeb8c1']],
  [['scriptVisual'], ['#276dc3', '#9cc2ed']],
  [['pythonVisual'], ['#3776ab', '#ffd43b']],
  [['keyDriversVisual', 'decompositionTreeVisual', 'qnaVisual', 'aiNarratives'], ['#6b5b95', '#c0b5da']],
  [['scorecard', 'rdlVisual'], ['#008c95', '#84d1d5']]
].flatMap(([ids, colors]) => ids.map(id => [id, colors])));

function normalizeRoleLabel(label) {
  const words = label.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').match(/[A-Za-z0-9]+/g) ?? [];
  return words.map((word, index) => index === 0
    ? word.toLowerCase()
    : `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`).join('');
}

test('pinned schema checksum matches the release profile', () => {
  assert.equal(verifySchema('2.150.5353.0').ok, true);
});

test('catalog resolves gallery aliases without conflating legacy cards', () => {
  const catalog = buildCatalog('2.150.5353.0');
  assert.ok(catalog.count >= 45);
  assert.equal(catalog.gallery.length, 37);
  assert.equal(new Set(catalog.gallery.map(item => item.label)).size, catalog.gallery.length);
  assert.ok(catalog.gallery.every(item => resolveVisual(catalog, item.id)));
  assert.ok(catalog.gallery.some(item => item.id === 'cardVisual'));
  assert.ok(!catalog.gallery.some(item => ['card', 'multiRowCard'].includes(item.id)));
  assert.equal(resolveVisual(catalog, 'Matrix').id, 'pivotTable');
  assert.equal(resolveVisual(catalog, 'current card').id, 'cardVisual');
  assert.equal(resolveVisual(catalog, 'legacy card').id, 'card');
  assert.equal(resolveVisual(catalog, 'multi row card').id, 'multiRowCard');
  assert.equal(resolveVisual(catalog, 'card').status, 'legacy-hidden');
});

test('exact-build role evidence covers the complete modeled gallery', () => {
  const catalog = buildCatalog('2.150.5353.0');
  const families = new Set(['cartesian', 'part-to-whole', 'map', 'card-kpi-gauge', 'filter', 'tabular', 'script', 'ai', 'scorecard', 'paginated-report']);
  const verificationStates = new Set(['verified', 'partial', 'pending']);
  const supportStates = new Set(['field-roles', 'configuration-only', 'unsupported', 'unknown']);
  const requirementStates = new Set(['required', 'optional', 'unknown']);
  const capacityStates = new Set(['single', 'multiple', 'unknown']);
  const fieldKinds = new Set(['column', 'measure', 'hierarchy']);

  assert.equal(buildRoleReference.release, '2.150.5353.0');
  assert.deepEqual(buildRoleReference.capture, {
    edition: 'Optimized for Power BI Report Server',
    fileVersion: '2.150.5353.0',
    productVersion: '2.150.5353.0 (25.12)+7b319eda3a6a7330c975420463a9398f79ab9ea0',
    locale: 'en-US',
    interactionMode: 'classic-visualizations-pane',
    observedAt: '2026-07-17',
    evidence: 'exact-live-ui'
  });
  assert.deepEqual(
    buildRoleReference.visuals.map(visual => visual.id),
    catalog.gallery.map(visual => visual.id)
  );
  assert.equal(buildRoleReference.visuals.filter(visual => visual.verification === 'verified').length, 30);
  assert.equal(buildRoleReference.visuals.filter(visual => visual.verification === 'pending').length, 7);

  for (const visual of buildRoleReference.visuals) {
    assert.ok(families.has(visual.family), `unknown family for ${visual.id}`);
    assert.ok(verificationStates.has(visual.verification), `unknown verification state for ${visual.id}`);
    assert.ok(supportStates.has(visual.support), `unknown support state for ${visual.id}`);
    assert.equal(new Set(visual.roles.map(role => role.id)).size, visual.roles.length, `duplicate role id for ${visual.id}`);

    if (visual.verification === 'verified' && visual.support === 'field-roles') {
      assert.ok(visual.roles.length > 0, `verified field roles missing for ${visual.id}`);
    }
    if (visual.verification !== 'verified' || visual.support === 'unknown') {
      assert.equal(typeof visual.reason, 'string', `reason missing for ${visual.id}`);
      assert.ok(visual.reason.length > 0, `empty reason for ${visual.id}`);
    }
    if (visual.verification === 'pending') {
      assert.equal(visual.support, 'unknown');
      assert.deepEqual(visual.roles, []);
    }

    visual.roles.forEach((role, order) => {
      assert.equal(role.order, order, `non-contiguous role order for ${visual.id}`);
      assert.equal(role.id, normalizeRoleLabel(role.label), `role id does not match label for ${visual.id}`);
      assert.ok(requirementStates.has(role.required), `unknown requirement state for ${visual.id}.${role.id}`);
      assert.ok(capacityStates.has(role.capacity), `unknown capacity state for ${visual.id}.${role.id}`);
      if (role.acceptedKinds) {
        assert.ok(role.acceptedKinds.length > 0, `empty acceptedKinds for ${visual.id}.${role.id}`);
        assert.ok(role.acceptedKinds.every(kind => fieldKinds.has(kind)), `unknown field kind for ${visual.id}.${role.id}`);
      }
      if ('defaultAggregation' in role) {
        assert.equal(typeof role.defaultAggregation, 'string');
        assert.ok(role.defaultAggregation.length > 0);
      }
    });
  }

  const byId = Object.fromEntries(buildRoleReference.visuals.map(visual => [visual.id, visual]));
  assert.deepEqual(byId.cardVisual.roles.map(role => role.label), ['Value', 'Categories', 'Tooltips']);
  assert.deepEqual(byId.clusteredBarChart.roles.map(role => role.label), ['Y-axis', 'X-axis', 'Legend', 'Small multiples', 'Tooltips']);
  assert.deepEqual(byId.pivotTable.roles.map(role => role.label), ['Rows', 'Columns', 'Values']);
});

test('manifest validation catches missing visuals and page overflow', () => {
  assert.equal(validateManifest(sample).ok, true);
  const invalid = structuredClone(sample);
  invalid.visuals[0].type = 'visual-that-never-existed';
  invalid.visuals[1].position.x = invalid.page.width;
  const result = validateManifest(invalid);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.includes('not in the release catalog')));
  assert.ok(result.errors.some(error => error.includes('page bounds')));
});

test('legacy and structured fields normalize to the additive assignment contract', () => {
  const roles = loadBuildRoles('2.150.5353.0');
  const byId = Object.fromEntries(roles.visuals.map(visual => [visual.id, visual]));
  const legacy = normalizeFieldAssignments(['Y-axis: Team[Name]'], byId.clusteredBarChart);
  const structured = normalizeFieldAssignments([
    { role: 'yAxis', field: 'Team[Name]', kind: 'unknown', aggregation: null }
  ], byId.clusteredBarChart);

  assert.deepEqual(legacy, structured);
  assert.deepEqual(legacy.assignments, [
    { role: 'yAxis', field: 'Team[Name]', kind: 'unknown', aggregation: null }
  ]);
  assert.deepEqual(
    normalizeFieldAssignments(['Measures[Open incidents]'], byId.cardVisual).assignments,
    [{ role: 'value', field: 'Measures[Open incidents]', kind: 'unknown', aggregation: null }]
  );
  assert.deepEqual(
    normalizeFieldAssignments([{ role: 'Y-axis', field: 'Team[Name]', kind: 'column' }], byId.clusteredBarChart).assignments,
    [{ role: 'yAxis', field: 'Team[Name]', kind: 'column', aggregation: null }]
  );

  const pending = normalizeFieldAssignments(['Model[Field]'], byId.azureMap);
  assert.equal(pending.assignments[0].role, null);
  assert.ok(pending.warnings.some(warning => warning.includes('could not infer a verified build role')));
});

test('structured field shape errors fail validation while semantic issues warn', () => {
  assert.ok(normalizeFieldAssignments({}, null).errors.some(error => error.includes('must be an array')));
  assert.ok(normalizeFieldAssignments([42], null).errors.some(error => error.includes('legacy string or structured')));

  const malformed = structuredClone(sample);
  malformed.visuals[0].fields = [
    { role: '', field: '' },
    { role: 'value', field: 'Measures[Open incidents]', kind: 'calculated' },
    { role: 'value', field: 'Measures[Open incidents]', aggregation: 42 }
  ];
  const invalid = validateManifest(malformed);
  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.some(error => error.includes('.role must be a non-empty string')));
  assert.ok(invalid.errors.some(error => error.includes('.field must be a non-empty string')));
  assert.ok(invalid.errors.some(error => error.includes('.kind must be one of')));
  assert.ok(invalid.errors.some(error => error.includes('.aggregation must be a string or null')));

  const syntheticRoles = {
    id: 'syntheticVisual',
    verification: 'verified',
    roles: [
      { id: 'value', label: 'Value', order: 0, required: 'required', capacity: 'single' },
      { id: 'category', label: 'Category', order: 1, required: 'required', capacity: 'multiple' }
    ]
  };
  const semantic = normalizeFieldAssignments([
    { role: 'value', field: 'Measures[Total]', kind: 'measure' },
    { role: 'value', field: 'Measures[Total]', kind: 'measure' },
    { role: 'mystery', field: 'Model[Field]', kind: 'column' }
  ], syntheticRoles, 'visuals[0].fields');
  assert.deepEqual(semantic.errors, []);
  assert.ok(semantic.warnings.some(warning => warning.includes("role 'mystery' is not defined")));
  assert.ok(semantic.warnings.some(warning => warning.includes('duplicates')));
  assert.ok(semantic.warnings.some(warning => warning.includes('single-capacity')));
  assert.ok(semantic.warnings.some(warning => warning.includes("required role 'category' empty")));
});

test('handbook JSON serialization escapes HTML-sensitive and separator characters', () => {
  const value = { manifest: '</script><script>&\u2028\u2029', catalog: '<catalog>', role: '&role', field: '>field<' };
  const serialized = serializeForHtmlData(value);
  assert.doesNotMatch(serialized, /[<>&\u2028\u2029]/u);
  assert.deepEqual(JSON.parse(serialized), value);

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pbi-handbook-escape-test-'));
  const manifestFile = path.join(temp, 'hostile.json');
  const output = path.join(temp, 'guide.html');
  const hostile = structuredClone(sample);
  hostile.title = value.manifest;
  hostile.organization = '<Example & Organization>';
  hostile.visuals[1].fields = [{
    role: 'yAxis',
    field: 'Team[<Name>&\u2028]',
    kind: 'column',
    aggregation: '</script>'
  }];
  fs.writeFileSync(manifestFile, JSON.stringify(hostile), 'utf8');
  buildHandbook(manifestFile, output);
  const html = fs.readFileSync(output, 'utf8');
  const payloadText = html.match(/<script type="application\/json" id="handbook-data">([^<]+)<\/script>/)[1];
  const payload = JSON.parse(payloadText);
  assert.doesNotMatch(payloadText, /[<>&\u2028\u2029]/u);
  assert.equal(payload.manifest.title, hostile.title);
  assert.equal(payload.visuals[1].fieldAssignments[0].field, hostile.visuals[1].fields[0].field);
  assert.doesNotMatch(html, /<\/script><script>&\u2028/u);
  assert.doesNotMatch(html, /\[object Object\]/);
});

test('build emits a standalone Power BI Desktop-style handbook', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pbi-handbook-test-'));
  const output = path.join(temp, 'guide.html');
  const result = buildHandbook(path.join(root, 'examples', 'sample-dashboard.json'), output);
  const html = fs.readFileSync(output, 'utf8');
  const payload = JSON.parse(html.match(/<script type="application\/json" id="handbook-data">([^<]+)<\/script>/)[1]);
  assert.equal(result.ok, true);
  assert.match(html, /Operations Pulse/);
  assert.match(html, /Release visual catalog/);
  assert.match(html, /class="titlebar"/);
  assert.match(html, /class="ribbon"/);
  assert.match(html, /class="inspector"/);
  assert.match(html, /\.inspector\{min-width:0;min-height:0;/);
  assert.match(html, /role="tablist" aria-label="Visualizations modes"/);
  assert.match(html, />Build visual</);
  assert.match(html, />Format page</);
  assert.match(html, /id="build-visual-panel"/);
  assert.match(html, /id="format-page-panel"/);
  assert.match(html, /id="visual-gallery"/);
  const galleryPalette = new Map();
  const paletteRules = html.matchAll(/((?:\.visual-gallery-button\[data-gallery-id="[^"]+"\],?)+)\{--visual-color:(#[0-9a-f]{6});--visual-accent:(#[0-9a-f]{6})\}/gi);
  for (const [, selectors, color, accent] of paletteRules) {
    for (const [, id] of selectors.matchAll(/data-gallery-id="([^"]+)"/g)) {
      assert.equal(galleryPalette.has(id), false, `duplicate gallery palette for ${id}`);
      galleryPalette.set(id, [color.toLowerCase(), accent.toLowerCase()]);
    }
  }
  assert.deepEqual(
    Object.fromEntries([...galleryPalette].sort(([left], [right]) => left.localeCompare(right))),
    Object.fromEntries(Object.entries(expectedGalleryPalette).sort(([left], [right]) => left.localeCompare(right)))
  );
  assert.match(html, /\.visual-gallery-button:hover\{[^}]*color:var\(--visual-color\)/);
  assert.match(html, /\.visual-gallery-button\[aria-pressed="true"\]\{[^}]*color:var\(--visual-color\)/);
  assert.match(html, /\.visual-gallery-button svg \.outline\{fill:none\}/);
  assert.match(html, /\.visual-gallery-button svg \.muted\{fill:var\(--visual-accent\);stroke:var\(--visual-accent\);opacity:1\}/);
  assert.match(html, /id="field-wells"/);
  assert.match(html, /id="format-search"/);
  assert.match(html, /id="format-page-name"/);
  assert.match(html, /id="format-page-tooltip"[^>]+role="switch"[^>]+aria-checked="false"/);
  assert.match(html, /id="format-page-qna"[^>]+role="switch"[^>]+aria-checked="true"/);
  assert.match(html, /id="format-page-reset"/);
  assert.match(html, /<option>16:9<\/option><option>4:3<\/option><option>Letter<\/option><option>Tooltip<\/option><option>Custom<\/option>/);
  assert.match(html, /id="format-canvas-alignment"><option>Top<\/option><option>Middle<\/option>/);
  assert.match(html, /id="format-canvas-reset"/);
  assert.ok(html.indexOf('for="format-canvas-height"') < html.indexOf('for="format-canvas-width"'));
  assert.match(html, /'16:9':\{width:1280,height:720\}/);
  assert.match(html, /initialCanvasType=Object\.entries\(canvasPresets\)/);
  assert.match(html, /pageReset\?\.addEventListener\('click'/);
  assert.match(html, /canvasReset\?\.addEventListener\('click'/);
  assert.match(html, /surfaceFormatContent\('format-canvas-background','Browse \.\.\.',\['Fit'\]\)/);
  assert.match(html, /surfaceFormatContent\('format-wallpaper','Wave',\['Fit','Stretch','Fill'\]\)/);
  assert.match(html, /id="\$\{id\}-color" type="color"/);
  assert.match(html, /id="\$\{id\}-image-file" type="file" accept="image\/\*" hidden/);
  assert.match(html, /id="\$\{id\}-transparency" type="range" min="0" max="100"/);
  assert.match(html, /initSurfaceControls\('format-canvas-background'/);
  assert.match(html, /initSurfaceControls\('format-wallpaper'/);
  assert.match(html, /name==='Filter pane'\?filterPaneContent\(\)/);
  assert.match(html, /name==='Filter cards'\?filterCardsContent\(\)/);
  assert.match(html, /filterSubcard\('Text'/);
  assert.match(html, /filterSubcard\('Search box'/);
  assert.match(html, /filterSubcard\('Options'/);
  assert.match(html, /id="format-filter-cards-state"><option>Default<\/option><option>Applied<\/option>/);
  assert.match(html, /filterNumberField\('format-filter-pane-width','Pane width','px',1,1000\)/);
  assert.match(html, /bindFilterNumber\('format-filter-pane-header-size',9,1,72\)/);
  assert.match(html, /bindFilterNumber\('format-filter-pane-search-size',10,1,72\)/);
  assert.match(html, /bindFilterNumber\('format-filter-pane-width',200,1,1000\)/);
  assert.match(html, /initFilterControls\('format-filter-cards-reset'/);
  assert.match(html, /id="vg-stacked-bar"/);
  assert.match(html, /id="global-search"/);
  assert.match(html, /id="status-filter"/);
  assert.match(html, /class="mobile-nav"/);
  assert.match(html, /pbi-handbook:/);
  assert.equal(payload.gallery.length, 37);
  assert.equal(payload.buildRoles.release, '2.150.5353.0');
  assert.equal(payload.buildRoles.visuals.length, 37);
  assert.equal(payload.gallery[0].label, 'Stacked bar chart');
  assert.equal(payload.gallery.find(item => item.id === 'pivotTable').label, 'Matrix');
  assert.equal(typeof payload.visuals[0].fields[0], 'string');
  assert.deepEqual(payload.visuals[0].fieldAssignments, [
    { role: 'value', field: 'Measures[Open incidents]', kind: 'unknown', aggregation: null }
  ]);
  assert.deepEqual(payload.visuals[2].fieldAssignments.map(assignment => assignment.role), ['rows', 'columns', 'values']);
  assert.equal(payload.pageGuide.formatRoot, 'Format page');
  assert.deepEqual(payload.pageGuide.sections, ['Page information', 'Canvas settings', 'Canvas background', 'Wallpaper', 'Filter pane', 'Filter cards']);
  assert.equal('file' in payload.schemaCheck, false);
  assert.match(html, /visual\.fieldAssignments/);
  assert.match(html, /assignmentRoleLabel/);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+rel=["']?stylesheet/i);
  assert.doesNotMatch(html, /__HANDBOOK_DATA__/);
});

test('desktop detection returns a transparent compatibility state', () => {
  const result = detectRelease('2.150.5353.0');
  assert.ok(['exact', 'schema-family', 'mismatch', 'not-installed', 'unreadable'].includes(result.compatibility));
  assert.equal(result.target, '2.150.5353.0');
});

#!/usr/bin/env node
/**
 * Rebuild-check — verify the committed example HTML is in sync with the
 * generator, template, and reference files.
 *
 * Builds examples/sample-dashboard-guide.html to a temporary location and
 * compares its content with the committed copy, ignoring the volatile
 * `generatedAt` timestamp.  Exits with code 1 if they differ.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildHandbook } from '../plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/scripts/handbook.mjs';

const root = path.resolve(import.meta.dirname, '..');
const examples = [
  {
    manifest: path.join(root, 'examples', 'sample-dashboard.json'),
    committed: path.join(root, 'examples', 'sample-dashboard-guide.html'),
    name: 'sample-dashboard-guide.html'
  },
  {
    manifest: path.join(root, 'examples', 'executive-sales-dashboard.json'),
    committed: path.join(root, 'examples', 'executive-sales-dashboard-guide.html'),
    name: 'executive-sales-dashboard-guide.html'
  },
  {
    manifest: path.join(root, 'examples', 'sales-scorecard.json'),
    committed: path.join(root, 'examples', 'sales-scorecard-guide.html'),
    name: 'sales-scorecard-guide.html'
  },
  {
    manifest: path.join(root, 'examples', 'university-of-melbourne.json'),
    committed: path.join(root, 'examples', 'university-of-melbourne-guide.html'),
    name: 'university-of-melbourne-guide.html'
  }
];

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pbi-rebuild-check-'));
const stripTimestamp = content => content.replace(/"generatedAt":"[^"]*"/g, '"generatedAt":"__STRIPPED__"');

let allOk = true;

for (const { manifest, committed, name } of examples) {
  if (!fs.existsSync(committed)) continue;
  const fresh = path.join(temp, name);
  buildHandbook(manifest, fresh);

  const committedContent = stripTimestamp(fs.readFileSync(committed, 'utf8'));
  const freshContent = stripTimestamp(fs.readFileSync(fresh, 'utf8'));

  if (committedContent === freshContent) {
    console.log(`✔ Committed ${name} is up to date with the generator.`);
  } else {
    console.error(`✘ Committed ${name} differs from a fresh build.`);
    console.error('  Run `npm run build` and commit the updated file.');
    allOk = false;
  }
}

if (!allOk) {
  process.exit(1);
}
process.exit(0);

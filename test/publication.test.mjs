import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ignoredDirectories = new Set(['.git', 'node_modules', 'coverage']);

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(absolute) : [absolute];
  });
}

const blocked = [
  {
    label: 'organization name',
    pattern: new RegExp(['Provincial', 'Electricity', 'Authority'].join('\\s+'), 'i')
  },
  {
    label: 'organization acronym',
    pattern: new RegExp(`\\b${['P', 'E', 'A'].join('')}\\b`, 'i')
  },
  {
    label: 'local username',
    pattern: new RegExp(['pak', 'orn'].join(''), 'i'),
    allowedPaths: new Set([
      'LICENSE',
      'README.md',
      'plugins/powerbi-desktop-handbook/.codex-plugin/plugin.json'
    ])
  },
  {
    label: 'local machine path',
    pattern: /[A-Z]:\\+(?:Users|VSCODE|Temp)\\+/i
  },
  {
    label: 'private project title',
    pattern: new RegExp(['Security', 'Executive'].join('\\s+'), 'i')
  },
  {
    label: 'private project source',
    pattern: new RegExp(['Spl', 'unk'].join(''), 'i')
  },
  {
    label: 'private model identifier',
    pattern: new RegExp(['Fact', '(?:ExecutivePeriod|CorrelationSearch)'].join(''), 'i')
  },
  {
    label: 'internal endpoint tooling identifier',
    pattern: new RegExp(`\\b${['SC', 'CM'].join('')}\\b`, 'i')
  },
  {
    label: 'credential assignment',
    pattern: /(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*["'][^"']+["']/i
  },
  {
    label: 'private key material',
    pattern: /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/
  }
];

test('public repository content excludes sensitive organization and environment data', () => {
  const findings = [];
  for (const file of collectFiles(root)) {
    const relative = path.relative(root, file).replaceAll(path.sep, '/');
    const bytes = fs.readFileSync(file);
    if (bytes.includes(0)) continue;
    const content = bytes.toString('utf8');
    for (const rule of blocked) {
      const approvedIdentityLocation = rule.allowedPaths?.has(relative);
      if (!approvedIdentityLocation && (rule.pattern.test(relative) || rule.pattern.test(content))) {
        findings.push(`${relative}: ${rule.label}`);
      }
    }
  }
  assert.deepEqual(findings, [], `Sensitive publication findings:\n${findings.join('\n')}`);
});

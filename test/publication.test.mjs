import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'coverage',
  'private',
  'customer',
  'customers',
  'local'
]);

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(absolute) : [absolute];
  });
}

const baseBlocked = [
  {
    label: 'local username',
    pattern: new RegExp(['pak', 'orn'].join(''), 'i'),
    allowedPaths: new Set([
      'LICENSE',
      'README.md',
      'CHANGELOG.md',
      'CONTRIBUTING.md',
      'schemas/manifest.schema.json',
      '.github/workflows/ci.yml',
      'plugins/powerbi-desktop-handbook/.codex-plugin/plugin.json'
    ])
  },
  {
    label: 'local machine path',
    pattern: /[A-Z]:\\+(?:Users|VSCODE|Temp)\\+/i
  },
  {
    label: 'credential assignment',
    pattern: /(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*["'][^"']+["']/i
  },
  {
    label: 'private key material',
    pattern: /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/
  },
  {
    label: 'internal ip address',
    pattern: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/
  }
];

function loadCustomBlockedRules() {
  const custom = [];
  const candidateFiles = [
    path.join(root, 'local', 'audit-blocklist.json'),
    path.join(root, 'private', 'audit-blocklist.json')
  ];

  for (const candidate of candidateFiles) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        if (Array.isArray(raw)) {
          for (const item of raw) {
            if (typeof item === 'string') {
              custom.push({ label: `custom pattern: ${item}`, pattern: new RegExp(item, 'i') });
            } else if (item && typeof item === 'object' && item.pattern) {
              custom.push({
                label: item.label ?? 'custom organization pattern',
                pattern: new RegExp(item.pattern, item.flags ?? 'i'),
                allowedPaths: item.allowedPaths ? new Set(item.allowedPaths) : undefined
              });
            }
          }
        }
      } catch (err) {
        console.warn(`Warning: Could not parse ${candidate}: ${err.message}`);
      }
    }
  }

  if (process.env.PBI_AUDIT_BLOCKLIST) {
    try {
      const parsed = JSON.parse(process.env.PBI_AUDIT_BLOCKLIST);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === 'string') {
            custom.push({ label: `env pattern: ${item}`, pattern: new RegExp(item, 'i') });
          } else if (item && item.pattern) {
            custom.push({
              label: item.label ?? 'env organization pattern',
              pattern: new RegExp(item.pattern, item.flags ?? 'i')
            });
          }
        }
      }
    } catch {
      for (const pattern of process.env.PBI_AUDIT_BLOCKLIST.split(',').map(s => s.trim()).filter(Boolean)) {
        custom.push({ label: `env pattern: ${pattern}`, pattern: new RegExp(pattern, 'i') });
      }
    }
  }

  return custom;
}

const blocked = [...baseBlocked, ...loadCustomBlockedRules()];

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

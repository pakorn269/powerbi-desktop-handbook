#!/usr/bin/env node
/**
 * Antigravity IDE Plugin Installer
 *
 * Installs the powerbi-desktop-handbook plugin and skill into the local
 * Antigravity IDE configuration (~/.gemini/config/plugins/) and workspace (.agents/plugins/).
 *
 * Usage:
 *   node scripts/install-antigravity.mjs [--mode=link|copy] [--uninstall] [--json]
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const pluginSource = path.join(root, 'plugins', 'powerbi-desktop-handbook');

const args = process.argv.slice(2);
const isUninstall = args.includes('--uninstall');
const isJson = args.includes('--json');
const modeArg = args.find(a => a.startsWith('--mode='));
const mode = modeArg ? modeArg.split('=')[1] : 'link';

const configDir = process.env.ANTIGRAVITY_CONFIG_DIR ||
  process.env.GEMINI_CONFIG_DIR ||
  path.join(os.homedir(), '.gemini', 'config');

const globalPluginDir = path.join(configDir, 'plugins', 'powerbi-desktop-handbook');
const workspacePluginDir = path.join(root, '.agents', 'plugins', 'powerbi-desktop-handbook');
const globalConfigJson = path.join(configDir, 'config.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function removeTarget(targetPath) {
  if (fs.existsSync(targetPath)) {
    const stat = fs.lstatSync(targetPath);
    if (stat.isSymbolicLink() || stat.isDirectory()) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(targetPath);
    }
    return true;
  }
  return false;
}

function linkOrCopy(source, target, copyMode) {
  removeTarget(target);
  ensureDir(path.dirname(target));

  if (copyMode === 'copy') {
    fs.cpSync(source, target, { recursive: true });
    return 'copied';
  } else {
    try {
      if (process.platform === 'win32') {
        fs.symlinkSync(source, target, 'junction');
      } else {
        fs.symlinkSync(source, target, 'dir');
      }
      return 'linked';
    } catch {
      // Fallback to copy if linking is disallowed
      fs.cpSync(source, target, { recursive: true });
      return 'copied (fallback)';
    }
  }
}

function updateGlobalConfig(enabled) {
  if (!fs.existsSync(configDir)) return;
  let config = {};
  if (fs.existsSync(globalConfigJson)) {
    try {
      config = JSON.parse(fs.readFileSync(globalConfigJson, 'utf8'));
    } catch {
      config = {};
    }
  }
  config.plugins = config.plugins || {};
  if (enabled) {
    config.plugins['powerbi-desktop-handbook'] = { enabled: true };
  } else {
    delete config.plugins['powerbi-desktop-handbook'];
  }
  fs.writeFileSync(globalConfigJson, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

try {
  if (isUninstall) {
    const globalRemoved = removeTarget(globalPluginDir);
    const workspaceRemoved = removeTarget(workspacePluginDir);
    updateGlobalConfig(false);

    const result = {
      ok: true,
      action: 'uninstall',
      globalRemoved,
      workspaceRemoved
    };

    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('✔ powerbi-desktop-handbook plugin uninstalled successfully.');
      console.log(`  Global target: ${globalPluginDir} (${globalRemoved ? 'removed' : 'not found'})`);
      console.log(`  Workspace target: ${workspacePluginDir} (${workspaceRemoved ? 'removed' : 'not found'})`);
    }
    process.exit(0);
  }

  if (!fs.existsSync(pluginSource)) {
    throw new Error(`Plugin source directory not found at: ${pluginSource}`);
  }

  // 1. Install globally for Antigravity IDE
  ensureDir(path.join(configDir, 'plugins'));
  const globalMethod = linkOrCopy(pluginSource, globalPluginDir, mode);
  updateGlobalConfig(true);

  // 2. Install at workspace level (.agents/plugins/)
  ensureDir(path.join(root, '.agents', 'plugins'));
  const workspaceMethod = linkOrCopy(pluginSource, workspacePluginDir, mode);

  const result = {
    ok: true,
    action: 'install',
    mode,
    globalPath: globalPluginDir,
    globalMethod,
    workspacePath: workspacePluginDir,
    workspaceMethod
  };

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('✔ powerbi-desktop-handbook plugin installed successfully for Antigravity IDE!');
    console.log(`  • Global plugin:    ${globalPluginDir} [${globalMethod}]`);
    console.log(`  • Global config:    Enabled in ${globalConfigJson}`);
    console.log(`  • Workspace plugin: ${workspacePluginDir} [${workspaceMethod}]`);
    console.log('\nThe agent skill `powerbi-desktop-handbook` is now active and ready to use in Antigravity.');
  }
} catch (err) {
  if (isJson) {
    console.error(JSON.stringify({ ok: false, error: err.message }));
  } else {
    console.error(`✘ Installation failed: ${err.message}`);
  }
  process.exit(1);
}

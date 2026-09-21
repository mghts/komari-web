import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function scan(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) scan(path);
    else if (/\.(tsx?|json)$/.test(path)) {
      assert.doesNotMatch(readFileSync(path, 'utf8'), /(?:github\.com|githubusercontent\.com)\/komari-monitor|ghcr\.io\/komari-monitor/,
        `Upstream runtime address in ${path}`);
    }
  }
}
scan(join(root, 'src'));
assert.equal(JSON.parse(readFileSync(join(root, 'komari-theme.json'))).url, 'https://github.com/mghts/komari-web');
// Execute the real TypeScript helpers using the already required TypeScript compiler.
function load(path) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(code, { exports, require: name => load(resolve(dirname(path), `${name}.ts`)) }, { filename: path });
  return exports;
}
const { generateAgentInstallCommand: command, AGENT_VERSION: version } = load(join(root, 'src/utils/agentInstall.ts'));
const args = ['-e', 'https://monitor.example.com', '-t', "test token';$(false)", '--disable-auto-update'];
const linux = command('linux', args);
const autoUpdateLinux = command('linux', ['-e', 'https://monitor.example.com', '-t', 'test-only', '--disable-auto-update=false']);
assert.ok(autoUpdateLinux.includes('--disable-auto-update=false'));
assert.ok(linux.includes(`https://github.com/mghts/komari-agent/releases/download/${version}/install.sh`));
assert.ok(linux.includes(`--install-version ${version}`));
assert.ok(command('linux', args, 'https://proxy.example/').includes(`https://proxy.example/https://github.com/mghts/komari-agent/`));
const docker = command('docker', [...args, '--install-dir', '/opt/custom', '--disable-auto-update=false']);
assert.ok(docker.includes(`ghcr.io/mghts/komari-agent:${version}`));
assert.ok(docker.includes('--disable-auto-update'));
assert.doesNotMatch(docker, /--install-dir|--disable-auto-update=false/);
const discovery = command('docker', ['-e', 'https://monitor.example.com', '--auto-discovery', 'test-key']);
assert.ok(discovery.includes('/app/auto-discovery.json'));
for (const value of [linux, docker, discovery]) {
  const syntax = spawnSync('sh', ['-n'], { input: value, encoding: 'utf8' });
  assert.equal(syntax.status, 0, syntax.stderr);
}
for (const path of ['src/pages/admin/index.tsx', 'src/components/admin/NodeTable/NodeFunction.tsx']) {
  assert.ok(readFileSync(join(root, path), 'utf8').includes('generateAgentInstallCommand('), `${path} must use the shared installer`);
}
if (process.argv[2]) {
  const lock = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8'));
  assert.equal(version, lock.version, 'Frontend Agent version must match Server build/agent.json');
  assert.ok(lock.image.startsWith('ghcr.io/mghts/komari-agent@sha256:'));
}
const { isNewerStableVersion: newer } = load(join(root, 'src/utils/releaseVersion.ts'));
for (const [latest, current, expected] of [
  ['1.4.4', '1.4.4-rc.2', true], ['1.4.4', '1.4.4', false],
  ['1.4.5-rc.1', '1.4.4', false], ['1.4.3', '1.4.4-rc.2', false],
  ['v1.4.5', '1.4.4+build.1', true], ['invalid', '1.4.4', false],
]) assert.equal(newer(latest, current), expected);
console.log('Fork runtime links, installation commands, Agent lock and stable update transitions passed.');

import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { projectRoot } from '../src/config/paths.js';

const folder = path.join(projectRoot, 'tests/integration');
const files = readdirSync(folder)
  .filter((file) => file.endsWith('.test.js'))
  .sort()
  .map((file) => path.join(folder, file));
if (!files.length) throw new Error('No integration test files found. Refusing to report success.');

const result = spawnSync(process.execPath, ['--test', ...files], {
  cwd: projectRoot,
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;

import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const tmpPath = resolve('.tmp');

if (existsSync(tmpPath)) {
  rmSync(tmpPath, { recursive: true, force: true });
}

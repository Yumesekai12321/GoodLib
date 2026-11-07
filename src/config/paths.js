import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
export const databasePath = () =>
  path.resolve(projectRoot, process.env.DB_PATH || 'data/goodlib.db');

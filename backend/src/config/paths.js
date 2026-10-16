import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const BACKEND_ROOT = path.resolve(here, '../..');
export const CV_DIR = path.join(BACKEND_ROOT, 'uploads', 'cv');

fs.mkdirSync(CV_DIR, { recursive: true });

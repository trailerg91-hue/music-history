// Legacy entry for Render (or other hosts) still starting `servers/index.js`.
// Real API lives in ../backend after the servers → backend move.
import { pathToFileURL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendEntry = path.join(__dirname, '..', 'backend', 'index.js');

await import(pathToFileURL(backendEntry).href);

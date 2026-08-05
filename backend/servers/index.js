// Legacy entry for hosts still starting `servers/index.js`.
// Real API lives in ../index.js (backend root).
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendEntry = path.join(__dirname, '..', 'index.js');

await import(pathToFileURL(backendEntry).href);

import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'vite';

await build({ build: { ssr: 'src/entry-server.tsx', outDir: 'dist-ssr', copyPublicDir: false } });
const { render } = await import('../dist-ssr/entry-server.js');
const path = new URL('../dist/index.html', import.meta.url);
const template = await readFile(path, 'utf8');
const placeholder = '<div id="root"></div>';
if (!template.includes(placeholder)) throw new Error('The Heyrin HTML template is missing its root element.');
await writeFile(path, template.replace(placeholder, () => '<div id="root">' + render() + '</div>'));

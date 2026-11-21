import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'vite';

await build({ build: { ssr: 'src/entry-server.tsx', outDir: 'dist-ssr', copyPublicDir: false } });
const { render } = await import('../dist-ssr/entry-server.js');
const path = new URL('../dist/index.html', import.meta.url);
const template = await readFile(path, 'utf8');
const placeholder = '<div id="root"></div>';
if (!template.includes(placeholder)) throw new Error('The Heyrin HTML template is missing its root element.');
// Ship the page styles with the prerendered markup so first paint needs no CSS round trip.
const stylesheet = template.match(/<link rel="stylesheet"[^>]* href="(\/assets\/[^"]+\.css)"[^>]*>/);
if (!stylesheet) throw new Error('Expected a bundled stylesheet in the production template.');
const css = await readFile(new URL('.' + stylesheet[1], path), 'utf8');
const styledTemplate = template.replace(stylesheet[0], () => '<style>' + css + '</style>');
await writeFile(path, styledTemplate.replace(placeholder, () => '<div id="root">' + render() + '</div>'));

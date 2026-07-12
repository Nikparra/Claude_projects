#!/usr/bin/env node
/* Downloads every remote photo referenced in data.js into images/, so the
 * site works offline and stops depending on third-party hosts.
 * The app automatically prefers images/<id>-<view>.png|.jpg over remote URLs.
 *
 * Usage:  node tools/fetch-images.mjs        (from the project root)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'data.js'), 'utf8');
const { CAMERAS, LENSES } = new Function(`${src}; return { CAMERAS, LENSES };`)();

const jobs = [];
for (const cam of CAMERAS) {
  for (const view of ['top', 'front', 'rear']) {
    const spec = cam.photos?.[view];
    if (spec?.src?.startsWith('http')) jobs.push({ id: cam.id, view, url: spec.src });
  }
}
for (const lens of LENSES) {
  if (lens.photo?.src?.startsWith('http')) jobs.push({ id: lens.id, view: 'top', url: lens.photo.src });
}

mkdirSync(join(root, 'images'), { recursive: true });
let ok = 0, skipped = 0, failed = 0;
for (const { id, view, url } of jobs) {
  const pngPath = join(root, 'images', `${id}-${view}.png`);
  const jpgPath = join(root, 'images', `${id}-${view}.jpg`);
  if (existsSync(pngPath) || existsSync(jpgPath)) { skipped++; continue; }
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get('content-type') || '';
    const buf = Buffer.from(await res.arrayBuffer());
    const dest = type.includes('jpeg') || type.includes('jpg') ? jpgPath : pngPath;
    writeFileSync(dest, buf);
    console.log(`✓ ${id}-${view}  (${(buf.length / 1024).toFixed(0)} kB)`);
    ok++;
  } catch (e) {
    console.warn(`✗ ${id}-${view}: ${e.message}  [${url}]`);
    failed++;
  }
}
console.log(`\n${ok} downloaded, ${skipped} already present, ${failed} failed (the app falls back to schematics for those).`);

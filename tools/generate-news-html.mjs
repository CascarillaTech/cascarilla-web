#!/usr/bin/env node
// Xera o HTML autónomo do cartel de cada nova (landscape e vertical) a partir
// do sitio xa construído (dist/news/poster|ig/<slug>/index.html).
//
// Uso: node tools/generate-news-html.mjs [<slug> ...]   (sen slugs: todas)
// Fai `npm run build` antes se cambiaches algo.

import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { writeStandaloneHtml } from './lib/standalone-html.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'public', 'images', 'news', 'generated');

let slugs = process.argv.slice(2);
if (slugs.length === 0) {
    slugs = readdirSync(path.join(ROOT, 'dist', 'news', 'poster'));
}

for (const slug of slugs) {
    const land = path.join(ROOT, 'dist', 'news', 'poster', slug, 'index.html');
    const ig = path.join(ROOT, 'dist', 'news', 'ig', slug, 'index.html');
    if (!existsSync(land) || !existsSync(ig)) {
        console.warn(`!! ${slug}: falta dist/news/{poster,ig}/${slug}/index.html — omitindo`);
        continue;
    }
    const dir = path.join(OUT, slug);
    mkdirSync(dir, { recursive: true });
    writeStandaloneHtml(land, path.join(dir, `${slug}.html`), ROOT);
    writeStandaloneHtml(ig, path.join(dir, `${slug}-ig.html`), ROOT);
    console.log(`ok ${slug}`);
}

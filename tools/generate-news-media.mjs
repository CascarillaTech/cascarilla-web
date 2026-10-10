#!/usr/bin/env node
// Xera, a partir das páxinas de cartel das novas (src/pages/news/poster|ig/
// [slug].astro), o vídeo promocional (HyperFrames), o PNG do seu fotograma
// final e o HTML autónomo, en public/images/news/generated/<slug>/:
//
//   <slug>.{mp4,png,html}      landscape 1920x1080 (LinkedIn)
//   <slug>-ig.{mp4,png,html}   vertical 1080x1920 (Instagram)
//
// Uso: node tools/generate-news-media.mjs <slug> [<slug> ...] [--only=landscape|vertical]
//      npm run media:news -- <slug> --only=vertical

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { writeStandaloneHtml } from './lib/standalone-html.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const HYPERFRAMES_VERSION = '0.8.40'; // a mesma que tools/generate-event-media.mjs
const VIDEO_QUALITY = 'looks';

const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.slice('--only='.length) : null;
if (only && !['landscape', 'vertical'].includes(only)) {
    console.error('--only agarda "landscape" ou "vertical"');
    process.exit(1);
}
const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (slugs.length === 0) {
    console.error('Uso: node tools/generate-news-media.mjs <slug> [<slug> ...] [--only=landscape|vertical]');
    process.exit(1);
}

// npm/npx son scripts .cmd en Windows: execFileSync precisa shell:true.
function run(cmd, args) {
    console.log(`+ ${cmd} ${args.join(' ')}`);
    execFileSync(cmd, args, { stdio: 'inherit', cwd: ROOT, shell: true });
}

// 1 só worker e captura por pantallazo: co paralelismo "auto" os fotogramas
// podían saír desordenados (ver tools/generate-event-media.mjs).
function renderComposition(compositionRelPath, outputRelPath) {
    run('npx', [
        '--yes', `hyperframes@${HYPERFRAMES_VERSION}`,
        'render', 'dist',
        '-c', compositionRelPath,
        '--output', outputRelPath,
        '--quality', VIDEO_QUALITY,
        '--workers', '1',
        '--experimental-fast-capture=false',
    ]);
}

// Extrae o ÚLTIMO fotograma polo seu índice exacto (-sseof pode quedar curto).
function extractLastFrame(videoRelPath, pngRelPath) {
    const nbFrames = parseInt(
        execFileSync('ffprobe', [
            '-v', 'error', '-select_streams', 'v:0', '-count_frames',
            '-show_entries', 'stream=nb_read_frames',
            '-of', 'default=nokey=1:noprint_wrappers=1',
            videoRelPath,
        ], { cwd: ROOT }).toString().trim(),
        10,
    );
    run('ffmpeg', [
        '-y', '-i', videoRelPath,
        '-vf', `select=eq(n\\,${nbFrames - 1})`,
        '-frames:v', '1', '-q:v', '2',
        pngRelPath,
    ]);
}

console.log('== Recompilando o sitio (astro build) ==');
run('npm', ['run', 'build']);

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const FORMATS = [
    { key: 'landscape', page: 'poster', suffix: '' },
    { key: 'vertical', page: 'ig', suffix: '-ig' },
];

for (const slug of slugs) {
    if (!SLUG_RE.test(slug)) {
        console.warn(`!! "${slug}" non parece un slug válido — omitindo`);
        continue;
    }
    const outRel = path.posix.join('public', 'images', 'news', 'generated', slug);
    mkdirSync(path.join(ROOT, outRel), { recursive: true });

    for (const fmt of FORMATS) {
        if (only && only !== fmt.key) continue;
        const src = path.posix.join('news', fmt.page, slug, 'index.html');
        if (!existsSync(path.join(ROOT, 'dist', src))) {
            console.warn(`!! dist/${src} non existe — omitindo ${slug} (${fmt.key})`);
            continue;
        }
        const base = path.posix.join(outRel, `${slug}${fmt.suffix}`);
        console.log(`\n== ${slug}: ${fmt.key} ==`);
        renderComposition(src, `${base}.mp4`);
        extractLastFrame(`${base}.mp4`, `${base}.png`);
        writeStandaloneHtml(path.join(ROOT, 'dist', src), path.join(ROOT, `${base}.html`), ROOT);
    }
}

console.log('\nListo.');

#!/usr/bin/env node
// Xera automaticamente, a partir da páxina "cartel" HTML/CSS xa existente
// (src/pages/events/poster/[slug].astro e .../events/ig/[slug].astro), o vídeo
// promocional (HyperFrames, landscape + vertical IG), o PNG estático do seu
// fotograma final e o HTML autónomo dun evento, en
// public/images/poster/generated/<slug>/.
//
// Uso: node tools/generate-event-media.mjs <slug> [<slug> ...]
//
// Non fai falla servidor propio: `hyperframes render` serve el mesmo o
// directorio `dist/` que lle pasamos coma proxecto, así que abonda con
// facer `astro build` antes de renderizar.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const HYPERFRAMES_VERSION = '0.8.40';
const VIDEO_QUALITY = 'looks';

// --only=landscape|vertical  (por defecto, os dous formatos)
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.slice('--only='.length) : null;
if (only && !['landscape', 'vertical'].includes(only)) {
    console.error('--only agarda "landscape" ou "vertical"');
    process.exit(1);
}
const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (slugs.length === 0) {
    console.error('Uso: node tools/generate-event-media.mjs <slug> [<slug> ...] [--only=landscape|vertical]');
    process.exit(1);
}

// npm/npx son scripts .cmd en Windows: execFileSync precisa shell:true para
// atopalos (o mesmo binario ffmpeg/ffprobe non o precisa, pero non estorba).
function run(cmd, args, opts = {}) {
    console.log(`+ ${cmd} ${args.join(' ')}`);
    execFileSync(cmd, args, { stdio: 'inherit', cwd: ROOT, shell: true, ...opts });
}

// extraArgs: o vertical renderízase con 1 só worker e captura por pantallazo —
// co paralelismo "auto" os fotogramas saían desordenados (a máquina de
// escribir reiniciábase e as letras pestanexaban). O landscape non o precisa.
function renderComposition(compositionRelPath, outputRelPath, extraArgs = []) {
    run('npx', [
        '--yes', `hyperframes@${HYPERFRAMES_VERSION}`,
        'render', 'dist',
        '-c', compositionRelPath,
        '--output', outputRelPath,
        '--quality', VIDEO_QUALITY,
        ...extraArgs,
    ]);
}

function extractLastFrame(videoRelPath, pngRelPath) {
    // -sseof busca por keyframe e pode quedar curto (perder o último
    // fotograma real); extraemos polo índice exacto de fotograma en vez
    // de por tempo.
    const nbFrames = parseInt(
        execFileSync('ffprobe', [
            '-v', 'error',
            '-select_streams', 'v:0',
            '-count_frames',
            '-show_entries', 'stream=nb_read_frames',
            '-of', 'default=nokey=1:noprint_wrappers=1',
            videoRelPath,
        ], { cwd: ROOT }).toString().trim(),
        10,
    );
    const lastIndex = nbFrames - 1;
    run('ffmpeg', [
        '-y',
        '-i', videoRelPath,
        '-vf', `select=eq(n\\,${lastIndex})`,
        '-frames:v', '1',
        '-q:v', '2',
        pngRelPath,
    ]);
}


const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

// Xera unha versión autónoma (CSS, JS e imaxes embebidos) da páxina de cartel,
// para poder abrila ou publicala sen o sitio.
function writeStandaloneHtml(htmlAbsPath, outAbsPath) {
    const dist = path.join(ROOT, 'dist');
    const fromDist = (url) => path.join(dist, url.replace(/^\//, ''));
    let html = readFileSync(htmlAbsPath, 'utf8');
    html = html.replace(/<link[^>]*rel="stylesheet"[^>]*href="(\/[^"]+\.css)"[^>]*>/g,
        (_, url) => {
            const css = readFileSync(fromDist(url), 'utf8').replace(/url\((\/[^)]+\.(?:ttf|woff2?))\)/g, (m, f) => {
                const file = fromDist(f);
                return existsSync(file)
                    ? `url(data:font/${path.extname(file).slice(1)};base64,${readFileSync(file).toString('base64')})`
                    : m;
            });
            return `<style>${css}</style>`;
        });
    html = html.replace(/<script[^>]*src="(\/[^"]+\.js)"[^>]*><\/script>/g,
        (_, url) => `<script type="module">${readFileSync(fromDist(url), 'utf8').replace(/<\/script/gi, '<\\/script')}</script>`);
    html = html.replace(/(src|href)="(\/[^"]+\.(?:png|jpe?g|svg|webp))"/g, (m, attr, url) => {
        const file = fromDist(url);
        if (!existsSync(file)) return m;
        const mime = MIME[path.extname(file).toLowerCase()];
        return `${attr}="data:${mime};base64,${readFileSync(file).toString('base64')}"`;
    });
    writeFileSync(outAbsPath, html);
}

console.log(`== Recompilando o sitio (astro build) ==`);
run('npm', ['run', 'build']);

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

for (const slug of slugs) {
    if (!SLUG_RE.test(slug)) {
        console.warn(`!! "${slug}" non parece un slug válido — omitindo (agárdase [a-z0-9-])`);
        continue;
    }
    const landscapeSrc = path.posix.join('events', 'poster', slug, 'index.html');
    const verticalSrc = path.posix.join('events', 'ig', slug, 'index.html');
    if (!existsSync(path.join(ROOT, 'dist', landscapeSrc))) {
        console.warn(`!! dist/${landscapeSrc} non existe (evento sen páxina de cartel?) — omitindo ${slug}`);
        continue;
    }

    // Cada evento ten o seu propio directorio:
    //   generated/<slug>/<slug>.{mp4,png,html}  e  <slug>-ig.{mp4,png}
    const outRel = path.posix.join('public', 'images', 'poster', 'generated', slug);
    mkdirSync(path.join(ROOT, outRel), { recursive: true });

    const landscapeVideo = path.posix.join(outRel, `${slug}.mp4`);
    const verticalVideo = path.posix.join(outRel, `${slug}-ig.mp4`);

    if (only !== 'vertical') {
        console.log(`\n== ${slug}: vídeo landscape ==`);
        renderComposition(landscapeSrc, landscapeVideo);
        console.log(`== ${slug}: cartel PNG landscape (fotograma final) ==`);
        extractLastFrame(landscapeVideo, path.posix.join(outRel, `${slug}.png`));
    }

    if (only !== 'landscape') {
        console.log(`\n== ${slug}: vídeo vertical (IG) ==`);
        renderComposition(verticalSrc, verticalVideo, ['--workers', '1', '--experimental-fast-capture=false']);
        console.log(`== ${slug}: cartel PNG vertical (fotograma final) ==`);
        extractLastFrame(verticalVideo, path.posix.join(outRel, `${slug}-ig.png`));
    }

    if (only === 'vertical') continue;
    console.log(`== ${slug}: HTML autónomo ==`);
    writeStandaloneHtml(path.join(ROOT, 'dist', landscapeSrc), path.join(ROOT, outRel, `${slug}.html`));
}

console.log('\nListo.');

#!/usr/bin/env node
// Xera automaticamente, a partir da páxina "cartel" HTML/CSS xa existente
// (src/pages/events/[slug].astro e .../events/ig/[slug].astro), o vídeo
// promocional (HyperFrames, landscape + vertical IG) e o PNG estático do
// seu fotograma final (Eventbrite / corunajug / redes) dun evento.
//
// Uso: node tools/generate-event-media.mjs <slug> [<slug> ...]
//
// Non fai falla servidor propio: `hyperframes render` serve el mesmo o
// directorio `dist/` que lle pasamos coma proxecto, así que abonda con
// facer `astro build` antes de renderizar.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const HYPERFRAMES_VERSION = '0.8.40'; // mesma versión pinada en video/package.json
const VIDEO_QUALITY = 'looks';

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
    console.error('Uso: node tools/generate-event-media.mjs <slug> [<slug> ...]');
    process.exit(1);
}

// npm/npx son scripts .cmd en Windows: execFileSync precisa shell:true para
// atopalos (o mesmo binario ffmpeg/ffprobe non o precisa, pero non estorba).
function run(cmd, args, opts = {}) {
    console.log(`+ ${cmd} ${args.join(' ')}`);
    execFileSync(cmd, args, { stdio: 'inherit', cwd: ROOT, shell: true, ...opts });
}

function renderComposition(compositionRelPath, outputRelPath) {
    run('npx', [
        '--yes', `hyperframes@${HYPERFRAMES_VERSION}`,
        'render', 'dist',
        '-c', compositionRelPath,
        '--output', outputRelPath,
        '--quality', VIDEO_QUALITY,
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

console.log(`== Recompilando o sitio (astro build) ==`);
run('npm', ['run', 'build']);

const videoRendersDir = path.join(ROOT, 'video', 'renders');
const posterDir = path.join(ROOT, 'public', 'images', 'poster', 'generated');
mkdirSync(videoRendersDir, { recursive: true });
mkdirSync(posterDir, { recursive: true });

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

for (const slug of slugs) {
    if (!SLUG_RE.test(slug)) {
        console.warn(`!! "${slug}" non parece un slug válido — omitindo (agárdase [a-z0-9-])`);
        continue;
    }
    const landscapeSrc = path.posix.join('events', slug, 'index.html');
    const verticalSrc = path.posix.join('events', 'ig', slug, 'index.html');
    if (!existsSync(path.join(ROOT, 'dist', landscapeSrc))) {
        console.warn(`!! dist/${landscapeSrc} non existe (evento sen páxina de cartel?) — omitindo ${slug}`);
        continue;
    }

    console.log(`\n== ${slug}: vídeo landscape ==`);
    const landscapeVideo = path.posix.join('video', 'renders', `${slug}.mp4`);
    renderComposition(landscapeSrc, landscapeVideo);

    console.log(`== ${slug}: vídeo vertical (IG) ==`);
    const verticalVideo = path.posix.join('video', 'renders', `${slug}-ig.mp4`);
    renderComposition(verticalSrc, verticalVideo);

    console.log(`== ${slug}: cartel PNG (fotograma final) ==`);
    extractLastFrame(landscapeVideo, path.posix.join('public', 'images', 'poster', 'generated', `${slug}.png`));
    extractLastFrame(verticalVideo, path.posix.join('public', 'images', 'poster', 'generated', `${slug}-ig.png`));
}

console.log('\nListo.');

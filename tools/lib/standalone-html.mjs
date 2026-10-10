// Xera unha versión autónoma (CSS, JS, fontes e imaxes embebidos) dunha
// páxina xa construída en dist/, para poder abrila ou publicala sen o sitio.
// Compartido por generate-event-media.mjs e generate-news-media.mjs.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildSync } from 'esbuild';

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

export function writeStandaloneHtml(htmlAbsPath, outAbsPath, rootDir) {
    const dist = path.join(rootDir, 'dist');
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
    // O script de Astro importa GSAP dun fragmento compartido (./index.xxxx.js):
    // incrustado tal cal, ese import relativo xa non existe. Empaquetámolo
    // (esbuild, xa presente por Vite) nun único script con todo dentro.
    html = html.replace(/<script[^>]*src="(\/[^"]+\.js)"[^>]*><\/script>/g, (_, url) => {
        const bundled = buildSync({
            entryPoints: [fromDist(url)],
            bundle: true,
            write: false,
            format: 'iife',
            minify: true,
            logLevel: 'silent',
        }).outputFiles[0].text;
        return `<script>${bundled.replace(/<\/script/gi, '<\\/script')}</script>`;
    });
    html = html.replace(/(src|href)="(\/[^"]+\.(?:png|jpe?g|svg|webp))"/g, (m, attr, url) => {
        const file = fromDist(url);
        if (!existsSync(file)) return m;
        const mime = MIME[path.extname(file).toLowerCase()];
        return `${attr}="data:${mime};base64,${readFileSync(file).toString('base64')}"`;
    });
    writeFileSync(outAbsPath, html);
}

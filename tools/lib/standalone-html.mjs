// Xera unha versión autónoma (CSS, JS, fontes e imaxes embebidos) dunha
// páxina xa construída en dist/, para poder abrila ou publicala sen o sitio.
// Compartido por generate-event-media.mjs e generate-news-media.mjs.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

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

// Xera o A4 frontal da camiseta de speakers de "Un día con IA" (camiseta clara).
// Uso: node design/camiseta-speakers/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const robotPng = readFileSync(join(here, 'robot-recortado.png')).toString('base64');
// incrusta un SVG de design/ como <svg> anidado (vectorial) na posición indicada, en mm
const inlineSvg = (f, x, y, w, h) => readFileSync(join(root, 'design', f), 'utf8')
  .replace(/<\?xml[^>]*>\s*/g, '')
  .replace(/<svg\b([^>]*?)\swidth="[^"]*"\s+height="[^"]*"/, `<svg$1 x="${x}" y="${y}" width="${w}" height="${h}"`);

// logos de patrocinadoras recortados ao contido, nunha fila centrada (alto en mm por logo)
const sponsorRow = { y: 262, gap: 10 };
const sponsorDefs = [
  ['odeene-color-horizontal.png', 9],
  ['bahia-software-color.png', 13],
  ['3mt-global-services.png', 14],
];
const sponsors = [];
for (const [f, h] of sponsorDefs) {
  const { data, info } = await sharp(join(root, 'public/images/colaboradoras', f)).trim().png().toBuffer({ resolveWithObject: true });
  sponsors.push({ h, w: h * info.width / info.height, href: 'data:image/png;base64,' + data.toString('base64') });
}
let sx = (210 - sponsors.reduce((a, s) => a + s.w, 0) - sponsorRow.gap * (sponsors.length - 1)) / 2;
for (const s of sponsors) {
  s.x = sx; s.y = sponsorRow.y + (14 - s.h) / 2; sx += s.w + sponsorRow.gap;
}

const variants = {
  clara: {
    shirt: '#F4F1EA',
    title: '#26160F', accent: '#B85C29', soft: '#5A3A28',
  },
};


function svg(v, { withShirt }) {
  const sans = `font-family="'Trebuchet MS','Avenir Next',Verdana,sans-serif"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="210mm" height="297mm" viewBox="0 0 210 297">
  ${withShirt ? `<rect width="210" height="297" fill="${v.shirt}"/>` : ''}

  <!-- organizadores: hexágonos 40x50 mm a escala 0.55, flanqueando SPEAKER -->
  ${inlineSvg('logo-letras-hexagono.svg', 14, 16.25, 22, 27.5)}
  ${inlineSvg('logo-corunajug-hexagono.svg', 174, 16.25, 22, 27.5)}

  <!-- SPEAKER -->
  <g ${sans} text-anchor="middle">
    <line x1="44" y1="30" x2="72" y2="30" stroke="${v.accent}" stroke-width="0.8"/>
    <line x1="138" y1="30" x2="166" y2="30" stroke="${v.accent}" stroke-width="0.8"/>
    <text x="105" y="33.5" font-size="10" font-weight="700" letter-spacing="3.2" fill="${v.accent}">SPEAKER</text>
  </g>

  <!-- robot (recorte 1840x2440 px de robot-x4.png) -->
  <image x="44" y="42" width="122" height="162" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${robotPng}"/>

  <!-- título -->
  <g ${sans} text-anchor="middle">
    <text x="105" y="222" font-size="25" font-weight="800" letter-spacing="0.5" fill="${v.title}">UN DÍA CON IA</text>
    <text x="105" y="236" font-size="7.4" font-weight="600" letter-spacing="2.6" fill="${v.accent}">A CORUÑA · 21 · 11 · 2026</text>
  </g>

  <!-- patrocinadoras -->
  <text x="105" y="256" text-anchor="middle" font-family="'Playfair Display',Georgia,serif" font-style="italic" font-size="6" fill="${v.soft}">Powered by</text>
${sponsors.map((s) => `  <image x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" preserveAspectRatio="xMidYMid meet" xlink:href="${s.href}"/>`).join('\n')}
</svg>`;
}

for (const [name, v] of Object.entries(variants)) {
  const print = svg(v, { withShirt: false });
  const preview = svg(v, { withShirt: true });
  writeFileSync(join(here, `camiseta-speakers-${name}.svg`), print);
  await sharp(Buffer.from(print), { density: 300 }).resize({ width: 2480 }).withMetadata({ density: 300 }).png().toFile(join(here, `camiseta-speakers-${name}.png`));
  await sharp(Buffer.from(preview), { density: 72 }).png().toFile(join(here, `preview-${name}.png`));
}
console.log('ok');

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

// unha camiseta por rol: lema grande e subtítulo opcional debaixo
const roles = {
  speakers: { lema: 'NOT AN AGENT', sub: 'POÑENTE' },
  staff: { lema: 'STAFF AGENT', sub: null },
};

function svg(v, role, { withShirt }) {
  const sans = `font-family="'Trebuchet MS','Avenir Next',Verdana,sans-serif"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="210mm" height="297mm" viewBox="0 0 210 297">
  ${withShirt ? `<rect width="210" height="297" fill="${v.shirt}"/>` : ''}

  <!-- organizadores: hexágonos 40x50 mm a escala 0.55, xuntos e centrados arriba -->
  ${inlineSvg('logo-letras-hexagono.svg', 81.5, 12, 22, 27.5)}
  ${inlineSvg('logo-corunajug-hexagono.svg', 106.5, 12, 22, 27.5)}

  <!-- lema -->
  <g ${sans} text-anchor="middle">
    <line x1="30" y1="52" x2="52" y2="52" stroke="${v.accent}" stroke-width="0.8"/>
    <line x1="158" y1="52" x2="180" y2="52" stroke="${v.accent}" stroke-width="0.8"/>
    <text x="105" y="55.5" font-size="10" font-weight="700" letter-spacing="2.4" fill="${v.accent}">${role.lema}</text>
  </g>
  ${role.sub ? `<text x="105" y="63" text-anchor="middle" ${sans} font-size="5.5" font-weight="600" letter-spacing="2.2" fill="${v.soft}">${role.sub}</text>` : ''}

  <!-- robot (recorte 1840x2440 px de robot-x4.png) -->
  <image x="53.5" y="67" width="103" height="137" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${robotPng}"/>

  <!-- título -->
  <g ${sans} text-anchor="middle">
    <text x="105" y="221" font-size="22" font-weight="800" letter-spacing="0.5" fill="${v.title}">UN DÍA CON IA</text>
    <text x="105" y="233" font-size="7" font-weight="600" letter-spacing="2.6" fill="${v.accent}">A CORUÑA · 21 · 11 · 2026</text>
  </g>

  <!-- patrocinadoras -->
  <text x="105" y="256" text-anchor="middle" font-family="'Playfair Display',Georgia,serif" font-style="italic" font-size="6" fill="${v.soft}">Powered by</text>
${sponsors.map((s) => `  <image x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" preserveAspectRatio="xMidYMid meet" xlink:href="${s.href}"/>`).join('\n')}
</svg>`;
}

// costas da camiseta de staff: STAFF lexible de lonxe e un prompt de terminal debaixo
function svgBack(v, { withShirt }) {
  const sans = `font-family="'Trebuchet MS','Avenir Next',Verdana,sans-serif"`;
  const mono = `font-family="Consolas,'Cascadia Mono','Courier New',monospace"`;
  const prompt = 'Try "ASK ME ANYTHING" ';
  const size = 10.5, charW = size * 0.55; // Consolas: avance de 0.55em
  const width = (2 + prompt.length) * charW + charW; // "> " + texto + cursor
  const x0 = 105 - width / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">
  ${withShirt ? `<rect width="210" height="297" fill="${v.shirt}"/>` : ''}
  <text x="105" y="90" text-anchor="middle" ${sans} font-size="52" font-weight="800" letter-spacing="2" fill="${v.title}">STAFF</text>
  <text x="${x0}" y="122" ${mono} font-size="${size}" xml:space="preserve"><tspan fill="${v.accent}" font-weight="700">&gt; </tspan><tspan fill="${v.soft}">${prompt.replace(/"/g, '&quot;')}</tspan></text>
  <rect x="${x0 + (2 + prompt.length) * charW}" y="${122 - size * 0.78}" width="${charW}" height="${size * 0.95}" fill="${v.accent}"/>
</svg>`;
}

for (const [name, v] of Object.entries(variants)) {
  writeFileSync(join(here, `camiseta-staff-costas-${name}.svg`), svgBack(v, { withShirt: false }));
  await sharp(Buffer.from(svgBack(v, { withShirt: false })), { density: 300 }).resize({ width: 2480 }).withMetadata({ density: 300 }).png().toFile(join(here, `camiseta-staff-costas-${name}.png`));
  await sharp(Buffer.from(svgBack(v, { withShirt: true })), { density: 72 }).png().toFile(join(here, `preview-staff-costas-${name}.png`));
}

for (const [roleName, role] of Object.entries(roles)) {
  for (const [name, v] of Object.entries(variants)) {
    const print = svg(v, role, { withShirt: false });
    const preview = svg(v, role, { withShirt: true });
    writeFileSync(join(here, `camiseta-${roleName}-${name}.svg`), print);
    await sharp(Buffer.from(print), { density: 300 }).resize({ width: 2480 }).withMetadata({ density: 300 }).png().toFile(join(here, `camiseta-${roleName}-${name}.png`));
    await sharp(Buffer.from(preview), { density: 72 }).png().toFile(join(here, `preview-${roleName}-${name}.png`));
  }
}
console.log('ok');

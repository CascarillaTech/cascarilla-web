// Xera o A4 frontal da camiseta de speakers de "Un día con IA" (camiseta clara).
// Uso: node design/camiseta-speakers/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const robotPng = readFileSync(join(here, 'robot-recortado.png')).toString('base64');
const jugLogo = readFileSync(join(root, 'public/images/corunajug-logo.png')).toString('base64');

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

  <!-- SPEAKER -->
  <g ${sans} text-anchor="middle">
    <line x1="40" y1="30" x2="72" y2="30" stroke="${v.accent}" stroke-width="0.8"/>
    <line x1="138" y1="30" x2="170" y2="30" stroke="${v.accent}" stroke-width="0.8"/>
    <text x="105" y="33.5" font-size="10" font-weight="700" letter-spacing="3.2" fill="${v.accent}">SPEAKER</text>
  </g>

  <!-- robot (recorte 1380x1830 px de un-dia-con-ia-robot.jpg) -->
  <image x="44" y="42" width="122" height="162" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${robotPng}"/>

  <!-- título -->
  <g ${sans} text-anchor="middle">
    <text x="105" y="222" font-size="25" font-weight="800" letter-spacing="0.5" fill="${v.title}">UN DÍA CON IA</text>
    <text x="105" y="236" font-size="7.4" font-weight="600" letter-spacing="2.6" fill="${v.accent}">A CORUÑA · 21 · 11 · 2026</text>
  </g>

  <!-- organizadores -->
  <g ${sans} text-anchor="middle">
    <line x1="60" y1="252" x2="150" y2="252" stroke="${v.soft}" stroke-width="0.4" opacity="0.6"/>
    <text x="104" y="268" text-anchor="end" font-size="6.4" font-weight="700" letter-spacing="1.6" fill="${v.soft}">CASCARILLA TECH</text>
    <text x="109" y="268" font-size="6" fill="${v.soft}">×</text>
    <image x="113" y="254" width="25" height="20" xlink:href="data:image/png;base64,${jugLogo}"/>
  </g>
</svg>`;
}

for (const [name, v] of Object.entries(variants)) {
  const print = svg(v, { withShirt: false });
  const preview = svg(v, { withShirt: true });
  writeFileSync(join(here, `camiseta-speakers-${name}.svg`), print);
  await sharp(Buffer.from(print), { density: 300 }).png().toFile(join(here, `camiseta-speakers-${name}.png`));
  await sharp(Buffer.from(preview), { density: 72 }).png().toFile(join(here, `preview-${name}.png`));
}
console.log('ok');

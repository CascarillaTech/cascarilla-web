// Xera o A4 frontal da camiseta de speakers de "Un día con IA" (versión camiseta escura e clara).
// Uso: node design/camiseta-speakers/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const robotSrc = readFileSync(join(root, 'src/assets/robot-cascarilla.svg'), 'utf8');
const robot = robotSrc.match(/<g id="robot"[\s\S]*?\n {6}<\/g>/)[0]
  .replace(/ transform="[^"]*"/, '');
const plateClip = robotSrc.match(/<defs>[\s\S]*?<\/defs>/)[0];
const jugLogo = readFileSync(join(root, 'public/images/corunajug-logo.png')).toString('base64');

const variants = {
  escura: {
    shirt: '#2B2B2B',
    roles: { limb: '#B85C29', cap: '#B85C29', shell: '#FFFFFF', plate: '#26160F', screen: '#26160F' },
    shellStroke: null,
    title: '#FFFFFF', accent: '#F5B54A', soft: '#E9D9BE',
  },
  clara: {
    shirt: '#F4F1EA',
    roles: { limb: '#B85C29', cap: '#B85C29', shell: '#FFFFFF', plate: '#26160F', screen: '#26160F' },
    shellStroke: '#26160F',
    title: '#26160F', accent: '#B85C29', soft: '#5A3A28',
  },
};

function paintRobot(v) {
  let g = robot;
  for (const [role, color] of Object.entries(v.roles)) {
    g = g.replace(new RegExp(`(data-role="${role}"[^>]*?)fill="#[0-9A-Fa-f]+"`, 'g'), `$1fill="${color}"`);
  }
  if (v.shellStroke) {
    g = g.replace(/data-role="shell"/g, `data-role="shell" stroke="${v.shellStroke}" stroke-width="7"`);
  }
  return g;
}

function svg(v, { withShirt }) {
  const sans = `font-family="'Trebuchet MS','Avenir Next',Verdana,sans-serif"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="210mm" height="297mm" viewBox="0 0 210 297">
  ${plateClip}
  ${withShirt ? `<rect width="210" height="297" fill="${v.shirt}"/>` : ''}

  <!-- SPEAKER -->
  <g ${sans} text-anchor="middle">
    <line x1="40" y1="30" x2="72" y2="30" stroke="${v.accent}" stroke-width="0.8"/>
    <line x1="138" y1="30" x2="170" y2="30" stroke="${v.accent}" stroke-width="0.8"/>
    <text x="105" y="33.5" font-size="10" font-weight="700" letter-spacing="3.2" fill="${v.accent}">SPEAKER</text>
  </g>

  <!-- robot: viewBox orixinal 512x600, área útil ~ x 100-412, y 15-475 -->
  <g transform="translate(105,113) scale(0.32) translate(-256,-245)">
    ${paintRobot(v)}
  </g>

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

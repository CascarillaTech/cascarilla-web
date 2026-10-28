// Opcións de camiseta estilo streetwear (referencia: "BULLDOZE" / "TOKYO limited edition").
// Reutiliza o robot recortado e os logos de design/. Uso: node design/camiseta-options/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

// sobre camiseta escura nótase a sombra gris baixo os pés: quítanse os grises claros só na franxa inferior
// (no resto do corpo eses grises son brillos do metal)
const { data: rob, info: robInfo } = await sharp(join(root, 'design/camiseta-speakers/robot-recortado.png'))
  .raw().toBuffer({ resolveWithObject: true });
const shadowFrom = robInfo.width * 4 * Math.floor(robInfo.height * 0.86);
for (let i = shadowFrom; i < rob.length; i += 4) {
  const [r, g, b] = [rob[i], rob[i + 1], rob[i + 2]];
  if (Math.max(r, g, b) - Math.min(r, g, b) < 20 && Math.min(r, g, b) > 120) rob[i + 3] = 0;
}
const robotPng = (await sharp(rob, { raw: robInfo }).png().toBuffer()).toString('base64');
// incrusta un SVG de design/ como <svg> anidado (vectorial) na posición indicada, en mm
const inlineSvg = (f, x, y, w, h) => readFileSync(join(root, 'design', f), 'utf8')
  .replace(/<\?xml[^>]*>\s*/g, '')
  .replace(/<svg\b([^>]*?)\swidth="[^"]*"\s+height="[^"]*"/, `<svg$1 x="${x}" y="${y}" width="${w}" height="${h}"`);

const c = { shirt: '#111111', ink: '#FFFFFF', copper: '#B85C29', amber: '#F5B54A' };
const impact = `font-family="Impact,'Bahnschrift',sans-serif"`;
const mono = `font-family="Consolas,'Courier New',monospace"`;
const jp = `font-family="'Yu Gothic','Meiryo',sans-serif"`;

const roles = {
  speakers: { band: 'NOT AN AGENT // POÑENTE', spec: ['> NOT AN AGENT. HUMAN SPEAKER, VERIFIED.'] },
  staff: { band: 'STAFF AGENT // ORGANIZACIÓN', spec: ['> STAFF AGENT. TRY "PÓDESME AXUDAR?"'] },
};

function checker(x, y, cols, rows, s) {
  let out = '';
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    if ((i + j) % 2 === 0) out += `<rect x="${x + i * s}" y="${y + j * s}" width="${s}" height="${s}" fill="${c.ink}"/>`;
  }
  return out;
}

function hazard(x, y, w, h) {
  let out = `<clipPath id="hz"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#hz)">`;
  for (let i = -h; i < w; i += 5) out += `<polygon points="${x + i},${y + h} ${x + i + h},${y} ${x + i + h + 2.5},${y} ${x + i + 2.5},${y + h}" fill="${c.ink}"/>`;
  return out + '</g>';
}

function svg(role, { withShirt }) {
  const spec = [...role.spec, '> UN DÍA CON IA · CIDADE DAS TIC · A CORUÑA', '> 21.11.2026 · CASCARILLA TECH × CORUÑA JUG'];
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="210mm" height="297mm" viewBox="0 0 210 297">
  ${withShirt ? `<rect width="210" height="297" fill="${c.shirt}"/>` : ''}

  <!-- título en bloque -->
  <text x="105" y="46" text-anchor="middle" ${impact} font-size="31.5" fill="${c.ink}">UN DÍA CON IA</text>
  <rect x="62" y="55" width="124" height="2.2" fill="${c.ink}"/>

  <!-- xaponés + barra curta -->
  <text x="14" y="70" ${jp} font-size="9" font-weight="700" fill="${c.ink}">人工知能</text>
  <rect x="54" y="64.5" width="20" height="2.2" fill="${c.ink}"/>

  <!-- bloques xeométricos detrás do robot -->
  <polygon points="140,92 198,80 198,132 140,142" fill="${c.ink}"/>
  <polygon points="150,160 198,152 198,196 166,201" fill="${c.ink}"/>

  <!-- texto vertical xigante -->
  <text transform="translate(44,214) rotate(-90)" ${impact} font-size="38" fill="${c.ink}">21.11.26</text>

  <!-- robot -->
  <image x="46" y="70" width="122" height="162" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${robotPng}"/>

  <!-- detalles: cruces de circuíto e damero -->
  <g stroke="${c.ink}" stroke-width="0.9" fill="none">
    <circle cx="20" cy="226" r="5"/><path d="M15 221 L25 231 M25 221 L15 231"/>
    <circle cx="33" cy="226" r="5"/><path d="M28 221 L38 231 M38 221 L28 231"/>
  </g>
  ${checker(176, 218, 7, 3, 3)}

  <!-- banda "limited edition" con franxas de perigo -->
  <rect x="14" y="236" width="104" height="9" fill="${c.copper}"/>
  <text x="17" y="243" ${impact} font-size="7" letter-spacing="0.6" fill="${c.shirt}">${role.band}</text>
  ${hazard(122, 236, 76, 9)}

  <!-- ficha técnica -->
  <g ${mono} font-size="3.3" fill="${c.ink}">
    ${spec.map((l, i) => `<text x="14" y="${254 + i * 5}">${l.replace(/"/g, '&quot;')}</text>`).join('\n    ')}
  </g>
  <rect x="124" y="249" width="1.4" height="17" fill="${c.ink}"/>

  <!-- selos: hexágonos e círculo IA -->
  ${inlineSvg('logo-letras-hexagono.svg', 131, 247, 16, 20)}
  ${inlineSvg('logo-corunajug-hexagono.svg', 150, 247, 16, 20)}
  <circle cx="183" cy="257" r="8.5" fill="${c.ink}"/>
  <text x="183" y="260.6" text-anchor="middle" ${impact} font-size="10" fill="${c.shirt}">IA</text>
</svg>`;
}

for (const [name, role] of Object.entries(roles)) {
  const file = `bulldoze-${name}`;
  const print = svg(role, { withShirt: false });
  writeFileSync(join(here, `${file}.svg`), print);
  await sharp(Buffer.from(print), { density: 300 }).resize({ width: 2480 }).withMetadata({ density: 300 }).png().toFile(join(here, `${file}.png`));
  await sharp(Buffer.from(svg(role, { withShirt: true })), { density: 72 }).png().toFile(join(here, `preview-${file}.png`));
}
console.log('ok');

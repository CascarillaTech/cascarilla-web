// Recorta o robot de robot-x4.png (un-dia-con-ia-robot.jpg reescalado x4 con Real-ESRGAN realesrgan-x4plus)
// e quítalle o fondo claro.
import sharp from 'sharp';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'robot-x4.png');
const crop = { left: 1200, top: 120, width: 1840, height: 2440 };
const { data, info } = await sharp(src).extract(crop).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const lum = (p) => Math.min(data[p * 4], data[p * 4 + 1], data[p * 4 + 2]);
const sat = (p) => Math.max(data[p * 4], data[p * 4 + 1], data[p * 4 + 2]) - lum(p);

// fondo = gris case branco (o da foto anda entre 244 e 252) conectado co bordo.
// Umbral axustado ao fondo real para non comer os brillos do cobre que tocan o bordo.
// Entre as pernas e baixo os pés o fondo escurece pola sombra: alí basta con que sexa gris claro
// (nesa zona o robot é cobre saturado ou xuntas negras).
const legsFrom = Math.floor(H * 0.6) * W;
const isBg = (p) => sat(p) < 14 && (lum(p) > 226 || (p >= legsFrom && lum(p) > 160));
const bg = new Uint8Array(W * H);
const stack = [];
for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
while (stack.length) {
  const p = stack.pop();
  if (bg[p] || !isBg(p)) continue;
  bg[p] = 1;
  const x = p % W;
  if (x > 0) stack.push(p - 1);
  if (x < W - 1) stack.push(p + 1);
  if (p >= W) stack.push(p - W);
  if (p < W * (H - 1)) stack.push(p + W);
}

// distancia (en px, ata 3) ao fondo, para tratar só a franxa do bordo
const dist = new Uint8Array(W * H).fill(255);
for (let p = 0; p < W * H; p++) if (bg[p]) dist[p] = 0;
for (let d = 1; d <= 3; d++) {
  for (let p = 0; p < W * H; p++) {
    if (dist[p] !== 255) continue;
    const x = p % W;
    if ((x > 0 && dist[p - 1] === d - 1) || (x < W - 1 && dist[p + 1] === d - 1) ||
        (p >= W && dist[p - W] === d - 1) || (p < W * (H - 1) && dist[p + W] === d - 1)) dist[p] = d;
  }
}

for (let p = 0; p < W * H; p++) {
  if (bg[p]) { data[p * 4 + 3] = 0; continue; }
  // no bordo, os píxeles mesturados co fondo branco van perdendo opacidade segundo o claros que son
  // (sen isto queda un halo branco sobre camiseta escura)
  if (dist[p] <= 3 && sat(p) < 40) {
    const a = Math.max(0, Math.min(1, (240 - lum(p)) / 70));
    data[p * 4 + 3] = Math.round(255 * Math.max(a, (dist[p] - 1) / 3));
  }
}
await sharp(data, { raw: info }).png().toFile(join(here, 'robot-recortado.png'));
console.log('ok');

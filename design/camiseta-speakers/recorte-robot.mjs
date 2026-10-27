// Recorta o robot de public/images/un-dia-con-ia-robot.jpg e quítalle o fondo claro (provisional:
// a orixe é de baixa resolución, para imprimir fai falta un orixinal grande ou un reescalado con IA).
import sharp from 'sharp';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', '..', 'public/images/un-dia-con-ia-robot.jpg');
const crop = { left: 300, top: 30, width: 460, height: 610 };
const { data, info } = await sharp(src).extract(crop).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
// fondo = píxeles claros e pouco saturados conectados co bordo (non borra os brillos do robot)
const W = info.width, H = info.height;
const isBg = (p) => {
  const r = data[p * 4], g = data[p * 4 + 1], b = data[p * 4 + 2];
  return Math.max(r, g, b) - Math.min(r, g, b) < 22 && Math.min(r, g, b) > 160;
};
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
// bordo suave: píxel de robot tocando fondo queda semitransparente
for (let p = 0; p < W * H; p++) {
  if (bg[p]) { data[p * 4 + 3] = 0; continue; }
  const n = (bg[p - 1] | 0) + (bg[p + 1] | 0) + (bg[p - W] | 0) + (bg[p + W] | 0);
  if (n) data[p * 4 + 3] = 255 - n * 40;
}
await sharp(data, { raw: info }).resize({ width: info.width * 3, kernel: 'lanczos3' }).png().toFile(join(here, 'robot-recortado.png'));
console.log('ok');

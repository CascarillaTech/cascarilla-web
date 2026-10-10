// Datos e tempos do cartel/vídeo dunha nova (src/components/NewsCard.astro).
// Mesma idea ca src/lib/eventPoster.ts + posterTiming.ts para os eventos:
// o servidor calcula a duración coa MESMA aritmética có timeline GSAP que
// constrúe o script do compoñente (mesmas constantes, mesma orde).
import { CHAR_STAGGER, CHAR_TAIL, RENDER_DURATION_PADDING } from './posterTiming';

export type NewsTipo = 'colaboradora' | 'ponente' | 'evento' | 'xeral';

export interface NewsCardData {
    tipo: NewsTipo;
    etiqueta: string;
    titular: string;
    liña: string;
    detalle: string;
    imaxe: string;
    pe: string;
}

const MESES = [
    'xaneiro', 'febreiro', 'marzo', 'abril', 'maio', 'xuño',
    'xullo', 'agosto', 'setembro', 'outubro', 'novembro', 'decembro',
];

function formatDate(d: Date): string {
    return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

// A descrición pode ser longa: para a tarxeta quedámonos coa primeira frase.
function firstSentence(text: string, max = 110): string {
    const first = text.split(/(?<=[.!?])\s/)[0] ?? text;
    return first.length <= max ? first : first.slice(0, max - 1).trimEnd() + '…';
}

export function deriveNewsCardData(entry: { data: any }): NewsCardData {
    const d = entry.data;
    const v = d.video ?? {};
    return {
        tipo: v.tipo ?? 'xeral',
        etiqueta: v.etiqueta ?? 'Nova',
        titular: v.titular ?? d.title,
        liña: v.liña ?? (d.description ? firstSentence(d.description) : ''),
        detalle: v.detalle ?? '',
        imaxe: v.imaxe ?? '',
        pe: v.pe ?? '', // banda inferior opcional: sen `pe`, non se pinta
    };
}

// --- Cronoloxía (segundos) — espello de boot() en NewsCard.astro ---
export const NEWS_INTRO = 0.75;          // etiqueta + imaxe xa entraron
export const NEWS_RULE_DURATION = 0.46;  // subrayado do titular

function chain(charCount: number): number {
    return charCount <= 0 ? 0 : (charCount - 1) * CHAR_STAGGER + 0.01 + CHAR_TAIL;
}
function real(charCount: number): number {
    return charCount <= 0 ? 0 : (charCount - 1) * CHAR_STAGGER + 0.01;
}

export function computeNewsRenderDuration(c: NewsCardData): number {
    const len = (s: string) => Array.from(s).length;
    let t = NEWS_INTRO;
    t += chain(len(c.titular));
    t += NEWS_RULE_DURATION;
    t += chain(len(c.liña));
    t += chain(len(c.detalle));
    const end = t + real(len(c.pe));
    return Math.ceil((end + RENDER_DURATION_PADDING) * 100) / 100;
}

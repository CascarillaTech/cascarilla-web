// Datos e tempos do cartel/vídeo dunha nova (src/components/NewsCard.astro).
// Mesma idea ca src/lib/eventPoster.ts + posterTiming.ts para os eventos:
// o servidor calcula a duración coa MESMA aritmética có timeline GSAP que
// constrúe o script do compoñente (mesmas constantes, mesma orde).
import { CHAR_STAGGER, CHAR_TAIL, RENDER_DURATION_PADDING } from './posterTiming';

export type NewsTipo = 'colaboradora' | 'ponente' | 'evento' | 'xeral';

/** Unha "pantalla" do vídeo: titular, liña e (opcional) detalle. */
export interface NewsScene {
    titular: string;
    liña: string;
    detalle: string;
}

export interface NewsCardData {
    tipo: NewsTipo;
    etiqueta: string;
    evento: string;       // nome do evento (cabeceira fixa), opcional
    titular: string;      // título da nova (para <title> e alt)
    escenas: NewsScene[]; // sempre ≥1; sen `video.escenas`, unha única
    imaxe: string;
    pe: string;
}

function firstSentence(text: string, max = 110): string {
    const first = text.split(/(?<=[.!?])\s/)[0] ?? text;
    return first.length <= max ? first : first.slice(0, max - 1).trimEnd() + '…';
}

export function deriveNewsCardData(entry: { data: any }): NewsCardData {
    const d = entry.data;
    const v = d.video ?? {};
    const titular: string = v.titular ?? d.title;

    // Con `video.escenas`, cada elemento é unha pantalla (a imaxe/logos e a
    // etiqueta quedan fixos). Sen elas, unha única pantalla como ata agora.
    const escenas: NewsScene[] = Array.isArray(v.escenas) && v.escenas.length > 0
        ? v.escenas.map((e: any) => ({
            titular: e.titular,
            liña: e.liña ?? '',
            detalle: e.detalle ?? '',
        }))
        : [{
            titular,
            liña: v.liña ?? (d.description ? firstSentence(d.description) : ''),
            detalle: v.detalle ?? '',
        }];

    return {
        tipo: v.tipo ?? 'xeral',
        etiqueta: v.etiqueta ?? 'Nova',
        evento: v.evento ?? '',
        titular,
        escenas,
        imaxe: v.imaxe ?? '',
        pe: v.pe ?? '', // banda inferior opcional: sen `pe`, non se pinta
    };
}

// --- Cronoloxía (segundos) — espello de boot() en NewsCard.astro ---
export const NEWS_INTRO = 0.75;          // etiqueta + imaxe xa entraron
export const NEWS_RULE_DURATION = 0.46;  // subrayado do titular
export const NEWS_SCENE_HOLD = 1.1;      // pausa coa pantalla completa
export const NEWS_SCENE_FADE = 0.35;     // saída da pantalla anterior

function chain(charCount: number): number {
    return charCount <= 0 ? 0 : (charCount - 1) * CHAR_STAGGER + 0.01 + CHAR_TAIL;
}
function real(charCount: number): number {
    return charCount <= 0 ? 0 : (charCount - 1) * CHAR_STAGGER + 0.01;
}

export function computeNewsRenderDuration(c: NewsCardData): number {
    const len = (s: string) => Array.from(s).length;
    let t = NEWS_INTRO;
    c.escenas.forEach((e, i) => {
        t += chain(len(e.titular));
        t += NEWS_RULE_DURATION;
        t += chain(len(e.liña));
        t += chain(len(e.detalle));
        if (i < c.escenas.length - 1) t += NEWS_SCENE_HOLD + NEWS_SCENE_FADE;
    });
    const end = t + real(len(c.pe));
    return Math.ceil((end + RENDER_DURATION_PADDING) * 100) / 100;
}

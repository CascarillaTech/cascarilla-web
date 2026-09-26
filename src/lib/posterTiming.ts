// Cálculo (server-side) da duración total da animación "máquina de escribir"
// dos cartéis de evento (poster.css / poster-story.css). Ten que replicar
// EXACTAMENTE a aritmética do timeline GSAP construído en runtime polos
// scripts de src/pages/events/[slug].astro e .../events/ig/[slug].astro
// (mesmas constantes, mesma orde de bloques) — é a fonte única desa
// aritmética para que non se desincronicen.
//
// Por que fai falla isto: HyperFrames le a duración do render do atributo
// ESTÁTICO data-duration do root ANTES de executar ningún script. Se se
// omite, intenta inferila do timeline en runtime, pero esa inferencia pode
// quedar curta (~cuestión de frames) e cortar o último bloque de texto a
// medio escribir. Fixar data-duration de forma estática evita ese risco.

export const CHAR_STAGGER = 0.033;
export const CHAR_TAIL = 0.13;
export const SPEAKER_FADE_DURATION = 0.5;
export const SPONSORS_TEXT_DURATION = 0.4;
export const SPONSORS_CIRCUIT_DURATION = 0.6;
export const SPONSORS_LOGO_DURATION = 0.5;
export const SPONSORS_LOGO_STAGGER = 0.12;

// Marxe extra despois do final "real" calculado. Empiricamente o contorno
// de render de HyperFrames necesita bastante máis folgura da que suxire a
// aritmética pura do timeline GSAP (probado: 0.15s aínda cortaba a última
// palabra) — mellor pasarnos un pouco (queda un intre amosando o cartel xa
// completo, o cal é positivo nun vídeo promocional) que arriscarnos a
// cortar texto en calquera evento futuro.
export const RENDER_DURATION_PADDING = 1.0;

// Tempo real que tarda en aparecer o ÚLTIMO carácter dun bloque de texto
// (sen ningunha marxe extra). Isto é o que de verdade determina cando
// remata a última tween do timeline.
function charRevealDuration(charCount: number): number {
    if (charCount <= 0) return 0;
    return (charCount - 1) * CHAR_STAGGER + 0.01;
}

// Igual có de arriba, pero engadindo CHAR_TAIL: é o valor que devolve
// addTypeStagger() no cliente para encadear o SEGUINTE bloque (deixarlle
// folgura antes de empezar). Esa marxe é real quen a "consume" é o bloque
// seguinte (as súas tweens arrincan máis tarde) — non hai que engadila
// despois do ÚLTIMO bloque do timeline, porque aí non a consome ninguén e
// tl.duration() non a reflicte.
function typeStaggerChainDuration(charCount: number): number {
    if (charCount <= 0) return 0;
    return charRevealDuration(charCount) + CHAR_TAIL;
}

export interface PosterSpeakerTiming {
    nameLength: number;
    roleLength: number;
}

export interface PosterTimingInput {
    titleLength: number;
    underlineDuration: number;
    subtitleLength: number;
    speakers: PosterSpeakerTiming[];
    sponsorsCount: number;
    footerDateLength: number;
    footerVenueLength: number;
}

/** Duración "real" da animación (sen marxe), en segundos. */
export function computePosterAnimationDuration(input: PosterTimingInput): number {
    let t = typeStaggerChainDuration(input.titleLength);
    t += input.underlineDuration;
    t += typeStaggerChainDuration(input.subtitleLength);

    for (const sp of input.speakers) {
        const speakerStart = t;
        const nameChainEnd = speakerStart + typeStaggerChainDuration(sp.nameLength);
        const roleChainEnd = nameChainEnd + typeStaggerChainDuration(sp.roleLength);
        t = Math.max(roleChainEnd, speakerStart + SPEAKER_FADE_DURATION);
    }

    const sponsorsStart = t;
    let sponsorsBlockEnd = sponsorsStart;
    if (input.sponsorsCount > 0) {
        sponsorsBlockEnd = Math.max(
            sponsorsStart + SPONSORS_TEXT_DURATION,
            sponsorsStart + SPONSORS_CIRCUIT_DURATION,
            sponsorsStart + (input.sponsorsCount - 1) * SPONSORS_LOGO_STAGGER + SPONSORS_LOGO_DURATION,
        );
    }

    // O bloque data/lugar é (case sempre) o último do timeline: o seu
    // remate real NON leva CHAR_TAIL despois, porque non hai máis nada que
    // encadear tras el.
    const dateChainEnd = sponsorsStart + typeStaggerChainDuration(input.footerDateLength);
    const finalTextEnd = input.footerVenueLength > 0
        ? dateChainEnd + charRevealDuration(input.footerVenueLength)
        : sponsorsStart + charRevealDuration(input.footerDateLength);

    return Math.max(sponsorsBlockEnd, finalTextEnd);
}

/** Duración a escribir en data-duration: a real + marxe, redondeada a 2 decimais. */
export function computePosterRenderDuration(input: PosterTimingInput): number {
    const raw = computePosterAnimationDuration(input) + RENDER_DURATION_PADDING;
    return Math.ceil(raw * 100) / 100;
}

// Lóxica de datos compartida entre as páxinas "cartel" dun evento
// (src/pages/events/poster/[slug].astro, horizontal, e .../story.astro,
// vertical). Deriva organizadores/sponsors/speakers/data a partir dun
// JSON OTE do evento — a mesma lóxica que event_to_poster_args() en
// gen_event_poster.py, para que as tres versións (Pillow, HTML horizontal,
// HTML vertical) non se desincronicen entre si.
//
// O que NON vai aquí: xeometría de layout (tamaños de círculo, anchos de
// título, etc.) — iso é específico de cada deseño e vive en cada .astro.

export const ORGANIZER_LOGOS: Record<string, string> = {
    "Coruña JUG": "corunajug-logo.png",
    "CoruñaWTF": "corunawtf-logo.png",
    "Coruña WTF": "corunawtf-logo.png",
};

export const MESES_GL = [
    "xaneiro", "febreiro", "marzo", "abril", "maio", "xuño",
    "xullo", "agosto", "setembro", "outubro", "novembro", "decembro",
];

export const DEFAULT_SPEAKER_SLOT = {
    name: "Coruña JUG",
    role: "Comunidade",
    image: "/images/poster/talks/default-corunajug-cascarilla.png",
    shape: "square",
};

/** Todos os eventos (próximos + pasados) como { [path]: módulo JSON }. */
export function getAllEventModules() {
    const proximos = import.meta.glob('../data/eventos/proximoseventos/*.json', { eager: true });
    const pasados = import.meta.glob('../data/eventos/eventospasados/*.json', { eager: true });
    return { ...proximos, ...pasados };
}

function slugify(text: string) {
    return text
        .normalize("NFD").replace(/\p{M}/gu, "")
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Cartel dunha charla dun evento: mesmo deseño, co título da charla, o
 *  nome do evento como subtítulo, a hora da charla e o/a poñente (agora
 *  cunha foto). Sae das entradas de agenda type "talk" que teñan `photo`. */
function talkPosterEvent(event: any, talk: any, withFooter = false) {
    const { agenda, ...rest } = event;
    return {
        ...rest,
        name: talk.name,
        subtitle: event.name,
        posterNoFooter: !withFooter,
        startDate: talk.startDate,
        endDate: talk.endDate,
        speakers: [{ name: talk.speaker, role: "Poñente", image: talk.photo.split('/').pop() }],
    };
}

/** getStaticPaths() común: un path por evento (slug = nome do ficheiro) e,
 *  por cada charla con foto, dous: <evento>-<poñente> (sen banda inferior,
 *  para presentar a charla) e <evento>-<poñente>-footer (con data e lugar,
 *  para o anuncio). */
export function eventStaticPaths() {
    const modules = getAllEventModules();
    return Object.entries(modules).flatMap(([path, mod]) => {
        const slug = path.split('/').pop()!.replace('.json', '');
        const event = (mod as any).default;
        const talks = (event.agenda || []).filter((i: any) => i.type === 'talk' && i.photo && i.speaker);
        return [
            { params: { slug }, props: { event } },
            // Variante sen banda inferior do cartel do evento (opt-in co campo
            // posterNoFooterVariant no JSON): <evento>-sen-footer.
            ...(event.posterNoFooterVariant
                ? [{ params: { slug: `${slug}-sen-footer` }, props: { event: { ...event, posterNoFooter: true } } }]
                : []),
            ...talks.flatMap((talk: any) => {
                const talkSlug = `${slug}-${slugify(talk.speaker)}`;
                return [
                    { params: { slug: talkSlug }, props: { event: talkPosterEvent(event, talk) } },
                    { params: { slug: `${talkSlug}-footer` }, props: { event: talkPosterEvent(event, talk, true) } },
                ];
            }),
        ];
    });
}

export function deriveEventPosterData(event: any) {
    // Organizadores: todos menos Cascarilla Tech van á esquerda, en orde.
    // Cascarilla Tech vai sempre fixa arriba-dereita (regra de deseño, non
    // de datos — cada páxina decide onde debuxala).
    const organizersLeft = (event.organizers || [])
        .filter((o: any) => o.name !== "Cascarilla Tech")
        .map((o: any) => ORGANIZER_LOGOS[o.name] || o.name);

    // Data/hora/lugar (formato galego, igual que event_to_poster_args)
    const dt = new Date(event.startDate);
    const dateStr = `${dt.getDate()} de ${MESES_GL[dt.getMonth()]} de ${dt.getFullYear()}`;
    const timeStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    const footerDate = `${dateStr}  ·  ${timeStr}`;
    const footerVenue = event.location?.venue || null;

    const sponsors = (event.sponsors || []).map((s: any) => s.img.split('/').pop());
    const speakers = (event.speakers && event.speakers.length) ? event.speakers : [DEFAULT_SPEAKER_SLOT];

    // Escala opcional do marco/foto do ponente (1 = tamaño estándar). Só a
    // usa un evento que a declare explicitamente no seu JSON — non afecta
    // a ningún outro evento por defecto.
    const speakerScale = (typeof event.speakerScale === 'number' && event.speakerScale > 0)
        ? event.speakerScale
        : 1;

    return { organizersLeft, footerDate, footerVenue, sponsors, speakers, speakerScale };
}

export function resolveSpeakerImage(sp: any) {
    if (!sp.image) return "/images/speaker-placeholder.svg";
    if (sp.image === DEFAULT_SPEAKER_SLOT.image) return sp.image;
    return `/images/poster/speakers/${sp.image.split('/').pop()}`;
}

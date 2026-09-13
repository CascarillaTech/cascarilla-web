// Lóxica de datos compartida entre as páxinas "cartel" dun evento
// (src/pages/events/[slug].astro, horizontal, e .../story.astro,
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

/** getStaticPaths() común: un path por evento, slug = nome do ficheiro. */
export function eventStaticPaths() {
    const modules = getAllEventModules();
    return Object.entries(modules).map(([path, mod]) => {
        const slug = path.split('/').pop()!.replace('.json', '');
        return { params: { slug }, props: { event: (mod as any).default } };
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

    return { organizersLeft, footerDate, footerVenue, sponsors, speakers };
}

export function resolveSpeakerImage(sp: any) {
    if (!sp.image) return "/images/speaker-placeholder.svg";
    if (sp.image === DEFAULT_SPEAKER_SLOT.image) return sp.image;
    return `/images/poster/speakers/${sp.image.split('/').pop()}`;
}

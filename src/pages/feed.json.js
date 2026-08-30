// Feed público de eventos de Cascarilla Tech, en formato "feed-community"
// da especificación OpenTechEvents (OTE) v0.3.0:
// https://opentechevents.org/schema/v0.3/feed.schema.json
//
// Cada evento xa vive en formato OTE no seu propio ficheiro JSON baixo
// src/data/eventos/ (mesma fonte que le src/pages/events.astro). Este
// endpoint xúntaos nun único feed público en /feed.json, resolvendo a
// herdanza de organizers/license/specVersion do feed cara a cada evento
// para non repetila quen a comparte co valor por defecto.

export const prerender = true;

const SITE_URL = "https://cascarillatech.org";
const FEED_ORGANIZER = { name: "Cascarilla Tech", url: SITE_URL };
const LICENSE = "CC-BY-4.0";

function toEvents(modules) {
  return Object.values(modules)
    .map((mod) => mod.default)
    .filter((evt) => evt && evt.name && evt.startDate);
}

function isDefaultOrganizer(organizers) {
  return (
    Array.isArray(organizers) &&
    organizers.length === 1 &&
    organizers[0].name === FEED_ORGANIZER.name &&
    organizers[0].url === FEED_ORGANIZER.url
  );
}

// specVersion e license son os que declara o feed: cada evento só os leva
// se algún día difiren do feed (non é o caso hoxe). organizers só se
// declara cando NON coincide co organizador por defecto do feed —
// declaralo SUBSTITÚE a herdanza, non a suma.
function toFeedEvent(event) {
  const { specVersion, license, organizers, ...rest } = event;
  return {
    ...rest,
    ...(isDefaultOrganizer(organizers) ? {} : { organizers }),
  };
}

// O schema (OTE v0.3, D015) rexeita un feed onde o updatedAt dalgún evento
// sexa posterior ao propio do feed. Derívase do máis recente entre os
// eventos en vez de fixalo a man, para que nunca quede desincronizado.
function latestUpdatedAt(events, fallback) {
  const stamps = events.map((e) => e.updatedAt).filter(Boolean);
  if (stamps.length === 0) return fallback;
  return stamps.reduce((latest, current) =>
    new Date(current) > new Date(latest) ? current : latest
  );
}

export function GET() {
  const proximosModules = import.meta.glob("../data/eventos/proximoseventos/*.json", {
    eager: true,
  });
  const pasadosModules = import.meta.glob("../data/eventos/eventospasados/*.json", {
    eager: true,
  });

  const rawEvents = [...toEvents(proximosModules), ...toEvents(pasadosModules)];
  const events = [...rawEvents]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map(toFeedEvent);

  const feed = {
    specVersion: "0.3.0",
    title: "Eventos de Cascarilla Tech",
    description: "Charlas e xuntanzas da comunidade tecnolóxica Cascarilla Tech.",
    url: SITE_URL,
    organizers: [FEED_ORGANIZER],
    license: LICENSE,
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    updatedAt: latestUpdatedAt(rawEvents, "2020-01-01T00:00:00Z"),
    events,
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

// Feed público de eventos de Cascarilla Tech, en formato "feed-community"
// da especificación OpenTechEvents (OTE) v0.3.0:
// https://opentechevents.org/schema/v0.3/feed.schema.json
//
// Cada evento xa vive en formato OTE no seu propio ficheiro JSON baixo
// src/data/eventos/ (mesma fonte que le src/pages/events.astro). Este
// endpoint xúntaos nun único feed público en /feed.json, resolvendo a
// herdanza de organizers/license/specVersion do feed cara a cada evento
// para non repetila quen a comparte co valor por defecto.

import { execFileSync } from "node:child_process";
import path from "node:path";

export const prerender = true;

// O dominio sae de `site` (astro.config.mjs, na raíz do proxecto) para non
// duplicalo aquí. Se algún día queda sen definir é mellor romper o build que
// publicar un feed con URLs inválidas, que é o que pasaría en silencio.
const SITE_URL = import.meta.env.SITE;
if (!SITE_URL) {
  throw new Error(
    "Falta `site` en astro.config.mjs: /feed.json precisa del para as URLs absolutas."
  );
}

const FEED_ORGANIZER = { name: "Cascarilla Tech", url: SITE_URL };
const LICENSE = "CC-BY-4.0";

// Data (ISO, UTC) do último commit que tocou o ficheiro do evento: é o
// `updatedAt` do evento, así non hai que acordarse de actualizalo a man.
// Usa a data de autor, que un rebase non cambia. Precisa o historial de git
// completo: o deploy fai checkout con fetch-depth: 0 por isto.
// Se o ficheiro aínda non está commiteado (ou non hai git) devolve null.
let shallowWarned = false;
function gitLastModified(file) {
  try {
    const git = (args) =>
      execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (!shallowWarned && git(["rev-parse", "--is-shallow-repository"]) === "true") {
      shallowWarned = true;
      console.warn(
        "[feed.json] Repositorio con historial parcial: os updatedAt dos eventos non serán fiables."
      );
    }
    const iso = git(["log", "-1", "--format=%aI", "--", file]);
    return iso ? new Date(iso).toISOString().replace(/\.\d{3}Z$/, "Z") : null;
  } catch {
    return null;
  }
}

// import.meta.glob devolve as chaves relativas á raíz do proxecto (/src/…),
// que é o directorio de traballo do build.
function toEvents(modules) {
  return Object.entries(modules)
    .map(([key, mod]) => ({ ...mod.default, __file: path.join(process.cwd(), key) }))
    .filter((evt) => evt.name && evt.startDate)
    .map(({ __file, ...evt }) => {
      const updatedAt = gitLastModified(__file) ?? evt.updatedAt;
      return updatedAt ? { ...evt, updatedAt } : evt;
    });
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
// eventos (que á súa vez saen de git, ver gitLastModified) en vez de fixalo
// a man, para que nunca quede desincronizado.
function latestUpdatedAt(events, fallback) {
  const stamps = events.map((e) => e.updatedAt).filter(Boolean);
  if (stamps.length === 0) return fallback;
  return stamps.reduce((latest, current) =>
    new Date(current) > new Date(latest) ? current : latest
  );
}

export function GET() {
  const proximosModules = import.meta.glob("/src/data/eventos/proximoseventos/*.json", {
    eager: true,
  });
  const pasadosModules = import.meta.glob("/src/data/eventos/eventospasados/*.json", {
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

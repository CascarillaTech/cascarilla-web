# Cascarilla Tech — web

Sitio web da asociación [Cascarilla Tech](https://cascarillatech.org), feito con
[Astro](https://astro.build) (saída estática) e [GSAP](https://gsap.com) para as
animacións dos carteis. Despregase en GitHub Pages.

## Comandos

Requiren Node ≥ 22.12.

| Comando           | Acción                                          |
| :---------------- | :---------------------------------------------- |
| `npm install`     | Instala as dependencias                         |
| `npm run dev`     | Servidor local en `localhost:4321`              |
| `npm run build`   | Compila o sitio a `./dist/`                     |
| `npm run preview` | Serve localmente o resultado de `npm run build` |

## Estrutura

```text
src/
├── pages/        rutas (about, events, membership, registration, …)
│   ├── events/[slug].astro       cartel 1200×630 dun evento
│   ├── events/ig/[slug].astro    cartel vertical 1080×1920 (Instagram)
│   ├── evento/un-dia-con-ia.astro  dossier do evento «Un día con IA»
│   └── feed.json.js              feed público de eventos (OpenTechEvents)
├── content/      textos editables en Markdown (novas, cotas, datos legais…)
├── data/         datos en JSON: eventos, comunidades, colaboradoras
├── layouts/  lib/  styles/
public/           estáticos (imaxes, dossier, fontes)
tools/            scripts de mantemento (ver abaixo)
video/renders/    vídeos promocionais xerados
```

## Eventos

Cada evento é un ficheiro JSON en formato
[OpenTechEvents](https://opentechevents.org) v0.3:

- `src/data/eventos/proximoseventos/` — o evento próximo (normalmente un só).
- `src/data/eventos/eventospasados/` — arquivo. Cando pasa un evento móvese
  aquí, sen cambiar o contido.
- `src/data/eventos/exemplo-meetup.json.template` — punto de partida.

O nome do ficheiro (sen `.json`) é o *slug* que se usa nas rutas
`/events/<slug>` e `/events/ig/<slug>`.

O `id` do evento é a URL canónica dese evento. Se o evento tamén está en
[corunajug.org](https://www.corunajug.org), usa **o mesmo `id` nos dous sitios**
(`https://www.corunajug.org/events/<slug>-<AAAA-MM-DD>`) para que un agregador
non o conte dúas veces. Se é só de Cascarilla Tech,
`https://cascarillatech.org/events/<slug>`.

`/feed.json` xúntaos todos. O `updatedAt` de cada evento sácase da data do seu
último commit en git (non se escribe a man), e o do feed é o máis recente deles.

Publicar un evento nos dous sitios e en Eventbrite faino a skill de Claude Code
`publish-event`.

## Cartel e vídeo automáticos

Ao facer commit dun evento novo ou modificado en `proximoseventos/`, un hook
`post-commit` xera o cartel PNG (`public/images/poster/generated/`) e os vídeos
landscape e vertical (`video/renders/`) e engádeos nun commit adicional
`chore(media): …`. Actívase unha vez por clon:

```bash
git config core.hooksPath tools/git-hooks
```

Tamén se pode lanzar a man con `node tools/generate-event-media.mjs <slug>`.
Necesita `ffmpeg` e `ffprobe` no `PATH`; o render usa HyperFrames sobre o
propio sitio compilado. Detalles en [`video/README.md`](video/README.md).

## Alta de socios/as

O formulario está en `/registration` e envía os datos a un Google Apps Script
que os garda nun Sheet. Ver [`tools/registration/README.md`](tools/registration/README.md).

## Despregue

Cada push a `main` compila e publica en GitHub Pages
(`.github/workflows/deploy.yml`). O dominio vén de `CNAME` e de `site` en
`astro.config.mjs`.

# video/renders/

Vídeos promocionais dos eventos (landscape 1200×630 e vertical IG 1080×1920),
renderizados coa CLI de HyperFrames directamente a partir do sitio xa
construído (`dist/events/<slug>/index.html` e `dist/events/ig/<slug>/index.html`)
— eses `.astro` son a fonte única do deseño e da animación, non hai ningunha
composición HyperFrames separada que manter aquí.

Xéranse (e regardénxeranse automaticamente ao facer commit dun evento novo
ou modificado en `src/data/eventos/proximoseventos/`) con:

```bash
node tools/generate-event-media.mjs <slug>
```

Ver `tools/generate-event-media.mjs` e `tools/git-hooks/post-commit`.

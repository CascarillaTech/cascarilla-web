# Backend de alta de socios

O formulario en si vive no propio sitio: [`src/pages/alta.astro`](../../src/pages/alta.astro)
(`https://cascarillatech.org/alta`). Este cartafol só garda o **backend**
que recibe eses datos.

- **`apps-script-alta-socios.gs`** — pégase en Extensións > Apps Script
  dun Google Sheet e desprégase como Web App. Instrucións completas no
  cabezallo do propio ficheiro.

## Despois de desplegar

Copia a URL que che dá Apps Script ao desplegar, e pégaa na constante
`SCRIPT_URL` de `src/pages/alta.astro` (busca `PEGA_AQUI_TU_URL_DE_APPS_SCRIPT`).

## Se cambian os prezos das cotas

Os prezos e nomes reais das cotas viven en
[`src/content/membership/cuotas.md`](../../src/content/membership/cuotas.md)
— `alta.astro` léos de aí automaticamente, así que a web nunca desincroniza.
Este script `.gs` **si** ten os prezos hardcodeados (`PRECIOS_MEMBRESIA`,
arriba do todo do ficheiro) porque non pode ler o `.md` do repo — se cambias
as cotas, acórdate de actualizar tamén aquí e volver desplegar unha nova
implementación.

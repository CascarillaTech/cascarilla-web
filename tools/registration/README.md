# Backend de alta de socios

O formulario en si vive no propio sitio: [`src/pages/registration.astro`](../../src/pages/registration.astro)
(`https://cascarillatech.org/registration`). Este cartafol só garda o
**backend** que recibe eses datos.

- **`apps-script-registration.gs`** — pégase en Extensións > Apps Script
  dun Google Sheet e desprégase como Web App. Instrucións completas no
  cabezallo do propio ficheiro.

## Estado actual

O Apps Script **xa está desprégado** e `SCRIPT_URL` en
`src/pages/registration.astro` xa apunta á súa URL, así que o formulario
funciona tal cal: non hai nada que configurar para usalo.

## Se cambias o script

- **Editar a implementación existente** (Implementar > Xestionar
  implementacións > editar > nova versión): a URL non cambia, non hai que
  tocar nada no repo.
- **Crear unha implementación nova**: Google dá unha URL distinta. Entón hai
  que copiala na constante `SCRIPT_URL` de `src/pages/registration.astro`.

## Se cambian os prezos das cotas

Os prezos e nomes reais das cotas viven en
[`src/content/membership/cuotas.md`](../../src/content/membership/cuotas.md)
— `registration.astro` léos de aí automaticamente, así que a web nunca
desincroniza. Este script `.gs` **si** ten os prezos hardcodeados
(`PRECIOS_MEMBRESIA`, arriba do todo do ficheiro) porque non pode ler o
`.md` do repo — se cambias as cotas, acórdate de actualizar tamén aquí e
publicar unha nova versión da implementación.

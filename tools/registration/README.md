# Backend de alta de socios

O formulario en si vive no propio sitio: [`src/pages/registration.astro`](../../src/pages/registration.astro)
(`https://cascarillatech.org/registration`). Este cartafol só garda o
**backend** que recibe eses datos: tres ficheiros que van xuntos, no
**mesmo** proxecto de Apps Script, atado ao **mesmo** Google Sheet.

- **[`alta.gs`](alta.gs)** — recibe o `doPost` do formulario público (garda
  a fila na folla "Socios").
- **[`Código.gs`](Código.gs)** — xestiona o envío dos tres correos (ver
  abaixo).
- **[`acciones-bot.gs`](acciones-bot.gs)** — o `doGet` autenticado que usa o
  bot de Telegram (ver [`tools/socios-bot-mcp/`](../socios-bot-mcp/)): todo o
  que o bot pode facer contra a folla, nun único sitio. Engade aquí as
  próximas accións do bot a medida que o vaias ampliando.

Apps Script comparte as funcións e variables globais entre tódolos ficheiros
dun mesmo proxecto, así que calquera dos tres pode chamar funcións definidas
nos outros sen problema, aínda que sexan ficheiros distintos neste repo
(p.ex. `acciones-bot.gs` usa `obtenerOCrearHoja()`/`respuesta()`, definidas
en `alta.gs`).

## Como despregar (proxecto novo)

1. Crea un Google Sheet novo (ou usa un existente).
2. Extensións > Apps Script.
3. Crea un ficheiro por cada un dos tres (`alta.gs`, `Código.gs`,
   `acciones-bot.gs`) dentro do MESMO proxecto, e pega en cada un o
   contido correspondente.
4. Configura as Propiedades do script (ver táboa abaixo).
5. Implementar > Nova implementación > Tipo "Aplicación web", Executar como
   "Ti", Acceso "Calquera usuario".
6. Copia a URL que dá en `SCRIPT_URL` de `src/pages/registration.astro`.
7. Crea os tres borradores de Gmail (ver abaixo) e o trigger instalable de
   `onEditInstalable` (Editor > Disparadores > Engadir disparador > evento
   "Ao editar").

## Estado actual

O Apps Script **xa está desprégado** e `SCRIPT_URL` en
`src/pages/registration.astro` xa apunta á súa URL. O `doPost` orixinal xa
funciona. `Código.gs` correspóndese co que hai realmente desprégado
(trasladado ao repo despois, non ao revés). `acciones-bot.gs` é NOVO,
aínda sen publicar — ver [`tools/socios-bot-mcp/DEPLOY.md`](../socios-bot-mcp/DEPLOY.md).

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
desincroniza. `alta.gs` **si** ten os prezos hardcodeados
(`PRECIOS_MEMBRESIA`, arriba do todo do ficheiro) porque non pode ler o
`.md` do repo — se cambias as cotas, acórdate de actualizar tamén aquí e
publicar unha nova versión da implementación.

## Os tres correos

| Correo | Cando se manda | Quen o dispara | Borrador de Gmail (asunto) |
|---|---|---|---|
| **DATOS** | Automático, en canto alguén envía o formulario público | `alta.gs` (`doPost`) | `Confirmacion` |
| **ALTA** | Cando cambias o Estado dunha fila de "Pendente" a "Pendente ingreso" | `Código.gs`, a man (checkbox columna K) | o que poñas en `ASUNTO_DRAFT_CONFIRMACION` |
| **BENVIDA** | Cando cambias o Estado de "Pendente ingreso" a "Confirmado" | `Código.gs`, a man (checkbox columna K) | o que poñas en `ASUNTO_DRAFT_BENVIDA` |

Os tres funcionan igual: buscan un BORRADOR en Gmail co asunto exacto
configurado, substitúen os marcadores `{{...}}` no seu corpo HTML, e mándano
co asunto real (`TITULO_EMAIL_*`). Se cambias o texto, edita o borrador en
Gmail — non fai falla tocar código.

Marcadores dispoñibles en cada un:

- **DATOS**: `{{nome}}`, `{{nome_completo}}`, `{{email}}`, `{{cota}}`, `{{prezo}}`
- **ALTA**: `{{nome}}`, `{{nome_completo}}`, `{{cota}}`, `{{prezo}}`
- **BENVIDA**: `{{nome}}`, `{{numero_socio}}`

Se falla o envío do correo DATOS (p.ex. non existe o borrador), a alta
**non se perde** — a fila xa quedou gardada na folla antes de intentar
mandar o correo — só se avisa a `EMAIL_ADMIN`.

### Propiedades do script necesarias

Configuración do proxecto (icona engrenaxe) > Propiedades do script:

| Propiedade | Para que serve |
|---|---|
| `SHEET_NAME` | Nome da folla, `Socios` |
| `EMAIL_ADMIN` | A quen avisar se falla un envío |
| `BOT_TOKEN` | Segredo do `doGet` do bot de Telegram (ver máis abaixo) |
| `ASUNTO_DRAFT_DATOS` | `Confirmacion` — asunto do borrador do correo DATOS |
| `ASUNTO_DRAFT_CONFIRMACION` | Asunto do borrador do correo ALTA |
| `ASUNTO_DRAFT_BENVIDA` | Asunto do borrador do correo BENVIDA |
| `TITULO_EMAIL_DATOS` | Asunto real co que se envía o correo DATOS |
| `TITULO_EMAIL_ALTA` | Asunto real co que se envía o correo ALTA |
| `TITULO_EMAIL_BENVIDA` | Asunto real co que se envía o correo BENVIDA |

## Accións do bot (acciones-bot.gs / doGet)

[`acciones-bot.gs`](acciones-bot.gs) ten o `doGet` autenticado que usa o bot
de Telegram (ver [`tools/socios-bot-mcp/`](../socios-bot-mcp/)). É o único
punto de entrada de lectura para o bot — a idea é ir engadindo aquí novas
accións (novos parámetros/ramas dentro do mesmo `doGet`, ou funcións
auxiliares novas) a medida que o bot medre, en vez de espallalas por varios
sitios.

Accións actuais:

| Acción | Como se chama | Que devolve |
|---|---|---|
| Consultar un socio | `?token=...&email=...` | Os datos dese socio (nº, fecha, cota, prezo, estado), ou `null` se non existe |
| Listar por estado | `?token=...&estado=Pendente\|Pendente ingreso\|Confirmado` | Lista de `{nome, nome_completo, estado}` — **sen email nin cota**, porque calquera pode pedir isto, non só a propia persoa |

Para activalo:

1. No editor de Apps Script: **Configuración do proxecto** (icona engrenaxe) >
   **Propiedades do script** > **Engadir propiedade do script**.
2. Nome: `BOT_TOKEN`. Valor: calquera cadea longa e aleatoria (é o segredo
   compartido co servidor MCP).
3. Copia ese mesmo valor na variable `BOT_TOKEN` do `.env` do servidor MCP.
4. Publica unha nova versión da implementación.

Sen esta propiedade configurada, `doGet` rexeita todas as peticións.

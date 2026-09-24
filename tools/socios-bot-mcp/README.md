# Servidor MCP do bot de socios

Servidor MCP (transporte stdio) que lle dá ao bot de Telegram/Hermes Agent
unha única capacidade: consultar se un email é socio de Cascarilla Tech,
consultando o `doGet` de
[`tools/registration/apps-script-registration.gs`](../registration/apps-script-registration.gs).

Non se despregou co sitio (Astro/GitHub Pages) — corre no VPS, coma
subproceso lanzado polo propio Hermes.

## Configurar

1. Segue primeiro os pasos de
   [`tools/registration/README.md`](../registration/README.md#endpoint-de-lectura-para-o-bot-doget)
   para activar o `doGet` no Apps Script (propiedade `BOT_TOKEN`).
2. `npm install` nesta carpeta.
3. Copia `.env.example` a `.env` e rechea `APPS_SCRIPT_URL` (a mesma URL
   `/exec` que xa usa `registration.astro`) e `BOT_TOKEN` (o mesmo valor que
   puxeches nas Propiedades do script).

## Probar solto (sen Hermes)

```bash
npm install
node --env-file=.env index.js
```

Queda esperando no stdio coma calquera servidor MCP — para probalo de
verdade, mellor conectalo directamente en Hermes (ver abaixo) e falar co
bot, ou usar un inspector MCP xenérico (`npx @modelcontextprotocol/inspector node index.js`).

## Conectalo a Hermes Agent

En `~/.hermes/config.yaml`, dentro do perfil/bot de socios:

```yaml
mcp_servers:
  socios:
    command: "node"
    args: ["/ruta/absoluta/a/tools/socios-bot-mcp/index.js"]
    env:
      APPS_SCRIPT_URL: "https://script.google.com/macros/s/XXXX/exec"
      BOT_TOKEN: "o-mesmo-segredo"
```

A tool queda dispoñible para o axente coma `mcp_socios_consultar_socio`.

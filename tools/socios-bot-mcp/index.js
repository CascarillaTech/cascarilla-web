/**
 * Servidor MCP para o bot de socios de Cascarilla Tech.
 *
 * Expón dúas tools que consultan o doGet do Apps Script de
 * tools/registration/acciones-bot.gs: `consultar_socio` (por email) e
 * `listar_socios` (por estado — aberta a calquera, por iso só devolve nome
 * e estado, nunca email). Pensado para ser lanzado por Hermes Agent coma un
 * subproceso local (transporte stdio), non coma un servidor HTTP
 * independente.
 *
 * Variables de entorno requiridas (ver .env.example):
 *   APPS_SCRIPT_URL — a URL "/exec" da implementación do Apps Script.
 *   BOT_TOKEN        — o mesmo segredo configurado nas Propiedades do script.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!APPS_SCRIPT_URL || !BOT_TOKEN) {
  console.error(
    "Faltan APPS_SCRIPT_URL e/ou BOT_TOKEN no ambiente. Mira .env.example."
  );
  process.exit(1);
}

const server = new McpServer({
  name: "socios-bot-mcp",
  version: "1.0.0"
});

server.tool(
  "consultar_socio",
  "Consulta se un email pertence a un socio de Cascarilla Tech e devolve o " +
    "seu número de socio, cota e estado. Non devolve datos doutros socios.",
  {
    email: z.string().email().describe("Email a consultar")
  },
  async ({ email }) => {
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.set("token", BOT_TOKEN);
    url.searchParams.set("email", email);

    let datos;
    try {
      const res = await fetch(url, { method: "GET" });
      datos = await res.json();
    } catch (err) {
      return {
        isError: true,
        content: [
          { type: "text", text: `Erro consultando o Apps Script: ${err.message}` }
        ]
      };
    }

    if (!datos.ok) {
      return {
        isError: true,
        content: [{ type: "text", text: datos.error || "Erro descoñecido." }]
      };
    }

    if (!datos.socio) {
      return {
        content: [
          { type: "text", text: `Non consta ningún socio con ese email.` }
        ]
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(datos.socio, null, 2) }]
    };
  }
);

const ESTADOS_VALIDOS = ["Pendente", "Pendente ingreso", "Confirmado"];

server.tool(
  "listar_socios",
  "Lista os socios que teñen un Estado exacto (Pendente, Pendente ingreso " +
    "ou Confirmado). Devolve só nome, nome completo e estado — nunca email " +
    "nin cota, porque calquera persoa pode pedir isto, non só a propia.",
  {
    estado: z.enum(ESTADOS_VALIDOS).describe("Estado exacto a filtrar")
  },
  async ({ estado }) => {
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.set("token", BOT_TOKEN);
    url.searchParams.set("estado", estado);

    let datos;
    try {
      const res = await fetch(url, { method: "GET" });
      datos = await res.json();
    } catch (err) {
      return {
        isError: true,
        content: [
          { type: "text", text: `Erro consultando o Apps Script: ${err.message}` }
        ]
      };
    }

    if (!datos.ok) {
      return {
        isError: true,
        content: [{ type: "text", text: datos.error || "Erro descoñecido." }]
      };
    }

    if (!datos.socios || datos.socios.length === 0) {
      return {
        content: [{ type: "text", text: `Non hai ningún socio con estado "${estado}".` }]
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(datos.socios, null, 2) }]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

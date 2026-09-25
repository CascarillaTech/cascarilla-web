/**
 * ACCIÓNS DO BOT - CASCARILLA TECH (acciones-bot.gs)
 * -----------------------------------------------------
 * Todo o que o bot de Telegram (Hermes Agent, ver tools/socios-bot-mcp/)
 * pode facer contra a folla "Socios", nun único punto de entrada GET.
 *
 * OLLO: vai XUNTO con alta.gs e Código.gs no MESMO proxecto de Apps Script,
 * atado ao mesmo Google Sheet — usa obtenerOCrearHoja() e respuesta(),
 * definidas en alta.gs. Ver tools/registration/README.md.
 *
 * Require un token secreto que NON vive neste ficheiro: Configuración do
 * proxecto > Propiedades do script > engade unha propiedade "BOT_TOKEN" co
 * valor que lle pasarás tamén ao servidor MCP (variable BOT_TOKEN no seu
 * .env). Sen esa propiedade configurada, doGet rexeita todas as peticións.
 *
 * Tamén ten avisarTelegramNovaAlta(), que chama alta.gs (doPost) cando
 * entra unha alta nova — manda un aviso por Telegram directamente coa API
 * de Telegram (non fai falla pasar por Hermes para isto). Require dúas
 * Propiedades do script máis: TELEGRAM_BOT_TOKEN (o token do bot, o mesmo
 * que usa Hermes) e TELEGRAM_ADMIN_CHAT_ID (o teu chat_id numérico). Se
 * calquera das dúas falta, non fai nada (non rompe a alta).
 *
 * Accións dispoñibles (engadir aquí as novas a medida que o bot medre):
 *
 *   ?token=...&email=...            → consulta se ESE email é socio (consultar_socio)
 *   ?token=...&listar=1             → lista TÓDOLOS socios (listar_socios, sen filtro)
 *   ?token=...&listar=1&estado=...  → lista socios con ESE Estado exacto
 *                                      "Pendente" / "Pendente ingreso" / "Confirmado".
 *                                      A listaxe (con ou sen filtro) só
 *                                      devolve nome, nome completo e estado
 *                                      — sen email nin cota, porque esta
 *                                      consulta está aberta a calquera que
 *                                      escriba ao bot, non só á propia
 *                                      persoa.
 */

function doGet(e) {
  const tokenEsperado = PropertiesService.getScriptProperties().getProperty("BOT_TOKEN");
  const tokenRecibido = e.parameter.token;
  if (!tokenEsperado || tokenRecibido !== tokenEsperado) {
    return respuesta({ ok: false, error: "Non autorizado." });
  }

  const email = (e.parameter.email || "").trim().toLowerCase();
  const listar = !!e.parameter.listar;
  const estado = (e.parameter.estado || "").trim();

  if (!email && !listar) {
    return respuesta({ ok: false, error: "Fai falla o parámetro email ou listar." });
  }

  const hoja = obtenerOCrearHoja();
  const numFilas = hoja.getLastRow() - 1; // sen cabeceira

  if (email) {
    if (numFilas <= 0) return respuesta({ ok: true, socio: null });

    const filas = hoja.getRange(2, 1, numFilas, 9).getValues();
    const fila = filas.find(function (f) {
      return String(f[5]).trim().toLowerCase() === email;
    });

    if (!fila) return respuesta({ ok: true, socio: null });

    return respuesta({
      ok: true,
      socio: {
        numeroSocio: fila[0],
        fechaAlta: fila[1],
        fechaBaixa: fila[2],
        nombre: fila[3],
        membership: fila[6],
        precio: fila[7],
        estado: fila[8]
      }
    });
  }

  // Listaxe, con ou sen filtro de estado
  if (numFilas <= 0) return respuesta({ ok: true, socios: [] });

  const filas = hoja.getRange(2, 1, numFilas, 9).getValues();
  const socios = filas
    .filter(function (f) { return !estado || String(f[8]).trim() === estado; })
    .map(function (f) {
      return { nombre: f[3], nombre_completo: f[4], estado: f[8] };
    });

  return respuesta({ ok: true, socios: socios });
}

// Aviso por Telegram de que entrou unha alta nova. Chámao doPost en
// alta.gs, xusto despois de gardar a fila. Usa a API de Telegram
// directamente (UrlFetchApp), non depende de que Hermes estea funcionando.
function avisarTelegramNovaAlta(datos, numeroSocio) {
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  const chatId = PropertiesService.getScriptProperties().getProperty("TELEGRAM_ADMIN_CHAT_ID");
  if (!token || !chatId) return; // non configurado — non facer nada

  const texto =
    "🆕 Nova alta de socio (nº " + numeroSocio + ")\n" +
    datos.nombre_completo + "\n" +
    datos.email + "\n" +
    "Cota: " + datos.membership;

  UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ chat_id: chatId, text: texto }),
    muteHttpExceptions: true
  });
}

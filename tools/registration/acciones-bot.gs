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
 * Ese aviso leva un botón de ENLACE (non de callback — non depende de que
 * Hermes estea escoitando) que apunta de volta a este mesmo doGet coa
 * acción "confirmar": ao premelo, cambia o Estado dese socio de "Pendente"
 * a "Pendente ingreso" na folla E manda directamente o correo ALTA
 * (reutilizando enviarCorreoDesdeDraft de Código.gs). NON depende do
 * trigger onEditInstalable — comprobado en produción que non se dispara de
 * forma fiable para cambios programáticos feitos dende o Web App, así que
 * o botón fai el mesmo todo o traballo en vez de esperar a que o dispare.
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
 *   ?token=...&confirmar=Nº_SOCIO   → botón do aviso de Telegram: pasa ESE
 *                                      socio de "Pendente" a "Pendente
 *                                      ingreso" (só se está en "Pendente";
 *                                      se xa cambiou de estado, non fai
 *                                      nada e dío). Devolve HTML, non JSON
 *                                      (ábrese nun navegador ao premer).
 */

function doGet(e) {
  const tokenEsperado = PropertiesService.getScriptProperties().getProperty("BOT_TOKEN");
  const tokenRecibido = e.parameter.token;
  if (!tokenEsperado || tokenRecibido !== tokenEsperado) {
    return respuesta({ ok: false, error: "Non autorizado." });
  }

  if (e.parameter.confirmar) {
    return confirmarIngreso(e.parameter.confirmar);
  }

  const email = (e.parameter.email || "").trim().toLowerCase();
  const listar = !!e.parameter.listar;
  const estado = (e.parameter.estado || "").trim();

  if (!email && !listar) {
    return respuesta({ ok: false, error: "Fai falla o parámetro email, listar ou confirmar." });
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
// Leva un botón de ENLACE que chama de volta ao propio doGet (acción
// "confirmar") para pasar o socio a "Pendente ingreso" dun toque.
function avisarTelegramNovaAlta(datos, numeroSocio) {
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  const chatId = PropertiesService.getScriptProperties().getProperty("TELEGRAM_ADMIN_CHAT_ID");
  if (!token || !chatId) return; // non configurado — non facer nada

  const botToken = PropertiesService.getScriptProperties().getProperty("BOT_TOKEN");
  const scriptUrl = ScriptApp.getService().getUrl(); // URL desta mesma implementación

  const texto =
    "🆕 Nova alta de socio (nº " + numeroSocio + ")\n" +
    datos.nombre_completo + "\n" +
    datos.email + "\n" +
    "Cota: " + datos.membership;

  const payload = { chat_id: chatId, text: texto };

  if (botToken && scriptUrl) {
    const confirmarUrl = scriptUrl + "?token=" + encodeURIComponent(botToken) + "&confirmar=" + numeroSocio;
    payload.reply_markup = {
      inline_keyboard: [[{ text: "✅ Pasar a Pendente ingreso", url: confirmarUrl }]]
    };
  }

  UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

// Chamada dende o botón do aviso de Telegram (?token=...&confirmar=Nº).
// Busca ESE número de socio e, se está en "Pendente", pásao a "Pendente
// ingreso" E manda o correo ALTA directamente (non depende do trigger
// onEditInstalable). Se xa non está en "Pendente" (xa se confirmou, ou é
// outra cousa), non toca nada e dío. Devolve HTML porque se abre nun
// navegador.
function confirmarIngreso(numeroSocioStr) {
  const numeroSocio = Number(numeroSocioStr);
  const hoja = obtenerOCrearHoja();
  const numFilas = hoja.getLastRow() - 1; // sen cabeceira

  if (numFilas <= 0 || isNaN(numeroSocio)) {
    return respuestaHtml("Non se atopou ningún socio con ese número.");
  }

  const filas = hoja.getRange(2, 1, numFilas, 9).getValues();
  const idx = filas.findIndex(function (f) { return Number(f[0]) === numeroSocio; });

  if (idx === -1) {
    return respuestaHtml("Non se atopou ningún socio co número " + numeroSocio + ".");
  }

  const nome = filas[idx][3];
  const nomeCompleto = filas[idx][4];
  const email = filas[idx][5];
  const cota = filas[idx][6];
  const prezo = filas[idx][7];
  const estadoActual = String(filas[idx][8]).trim();

  if (estadoActual !== "Pendente") {
    return respuestaHtml(nome + " (nº " + numeroSocio + ") xa está en estado \"" + estadoActual + "\", non se cambiou nada.");
  }

  const fila = idx + 2; // +2: cabeceira (fila 1) + índice 0-based
  hoja.getRange(fila, 9).setValue("Pendente ingreso"); // columna I = Estado

  try {
    enviarCorreoDesdeDraft(ASUNTO_DRAFT_CONFIRMACION, TITULO_EMAIL_ALTA, email, {
      '{{nome}}': nome,
      '{{nome_completo}}': nomeCompleto,
      '{{cota}}': cota,
      '{{prezo}}': prezo
    });
  } catch (err) {
    avisarAdmin("Cambiouse o estado a \"Pendente ingreso\" do nº " + numeroSocio + " pero fallou o envío do correo ALTA: " + err.message);
    return respuestaHtml("Estado cambiado a \"Pendente ingreso\", pero fallou o envío do correo ALTA (avisouse por email).");
  }

  return respuestaHtml("✅ Confirmado. " + nome + " (nº " + numeroSocio + ") pasou a \"Pendente ingreso\" e mandouse o correo ALTA.");
}

function respuestaHtml(mensaje) {
  return HtmlService.createHtmlOutput(
    '<html><body style="font-family:sans-serif;padding:2rem;text-align:center;font-size:1.2rem">' +
      mensaje +
    "</body></html>"
  );
}

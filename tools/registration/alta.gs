/**
 * ALTA DE SOCIOS - CASCARILLA TECH (alta.gs)
 * --------------------------------------------
 * Backend do formulario en https://cascarillatech.org/registration (src/pages/registration.astro).
 *
 * OLLO: este ficheiro vai XUNTO con Código.gs no MESMO proxecto de Apps
 * Script, atado ao mesmo Google Sheet — non van en proxectos separados.
 * Apps Script comparte as funcións globais entre tódolos ficheiros .gs dun
 * proxecto, así que doPost (aquí embaixo) pode chamar directamente a
 * avisarAdmin() e enviarCorreoDesdeDraft(), que están definidas en
 * Código.gs. Ver tools/registration/README.md para o despregue completo.
 *
 * Ao desplegar o proxecto como "Web App" dá unha URL á que o formulario
 * HTML envía os datos por POST. Non fai falla backend propio.
 *
 * Cada vez que cambies este código, terás que crear unha NOVA implementación
 * (ou "Xestionar implementacións" > editar) para que os cambios teñan efecto.
 *
 * Os prezos e nomes das cotas veñen de src/content/membership/cuotas.md — se
 * cambian alí, cambia tamén PRECIOS_MEMBRESIA aquí embaixo para que coincidan
 * (este script non pode ler o .md do repo, é independente del).
 *
 * ENDPOINT DE LECTURA (doGet) PARA O BOT:
 * Ademais do POST público de alta, hai un GET autenticado que consulta se un
 * email é socio (úsao o bot de Telegram, ver tools/socios-bot-mcp/). Require
 * un token secreto que NON vive neste ficheiro: Configuración do proxecto >
 * Propiedades do script > engade unha propiedade "BOT_TOKEN" co valor que
 * lle pasarás tamén ao servidor MCP (variable BOT_TOKEN no seu .env). Sen
 * esa propiedade configurada, o doGet rexeita todas as peticións.
 */

const NOMBRE_HOJA = "Socios";

// Prezos asociados a cada cota, para non depender de que o cliente os mande
// ben. As claves teñen que coincidir co value dos radio en registration.astro
// (nome da cota en minúsculas: "short", "int", "long").
const PRECIOS_MEMBRESIA = {
  short: "16€/ano",
  int: "32€/ano",
  long: "64€/ano"
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // evita que dúas solicitudes simultáneas collan o mesmo número de socio

    const hoja = obtenerOCrearHoja();
    const datos = JSON.parse(e.postData.contents);

    // Validación mínima en servidor (nunca confíes só no HTML)
    if (!datos.nombre || !datos.nombre_completo || !datos.email
        || !datos.membership || !datos.terms || !datos.privacy) {
      return respuesta({ ok: false, error: "Faltan campos obrigatorios." });
    }

    const numeroSocio = seguinteNumeroSocio(hoja);

    hoja.appendRow([
      numeroSocio,
      new Date(),
      "", // Data de baixa: baleiro ata que a persoa cause baixa (cúbrese a man)
      datos.nombre,
      datos.nombre_completo,
      datos.email,
      datos.membership,
      PRECIOS_MEMBRESIA[datos.membership] || "",
      "Pendente" // estado da alta: cámbiao a man a "Aprobado" cando a procesedes
    ]);

    // Correo "DATOS": confirma á persoa o que acaba de enviar. É o único
    // automático (os outros dous, ALTA e BENVIDA, mándanse a man dende
    // Código.gs cando cambias o Estado). Se falla (p.ex. non existe o
    // borrador "Confirmacion" en Gmail), non tombamos a alta — xa quedou
    // gardada na folla — só avisamos ao admin.
    try {
      enviarCorreoDesdeDraft(ASUNTO_DRAFT_DATOS, TITULO_EMAIL_DATOS, datos.email, {
        '{{nome}}': datos.nombre,
        '{{nome_completo}}': datos.nombre_completo,
        '{{email}}': datos.email,
        '{{cota}}': datos.membership,
        '{{prezo}}': PRECIOS_MEMBRESIA[datos.membership] || ""
      });
    } catch (err) {
      avisarAdmin(`Non se puido enviar o correo de confirmación de datos a ${datos.email} (alta nº ${numeroSocio}): ${err.message}`);
    }

    return respuesta({ ok: true, numeroSocio });
  } catch (err) {
    return respuesta({ ok: false, error: err.message });
  } finally {
    lock.releaseLock();
  }
}

// GET autenticado para o bot: ?token=...&email=...
// Devolve só a fila que coincide co email pedido (nunca a folla enteira).
function doGet(e) {
  const tokenEsperado = PropertiesService.getScriptProperties().getProperty("BOT_TOKEN");
  const tokenRecibido = e.parameter.token;
  if (!tokenEsperado || tokenRecibido !== tokenEsperado) {
    return respuesta({ ok: false, error: "Non autorizado." });
  }

  const email = (e.parameter.email || "").trim().toLowerCase();
  if (!email) {
    return respuesta({ ok: false, error: "Falta o parámetro email." });
  }

  const hoja = obtenerOCrearHoja();
  const numFilas = hoja.getLastRow() - 1; // sen cabeceira
  if (numFilas <= 0) {
    return respuesta({ ok: true, socio: null });
  }

  const filas = hoja.getRange(2, 1, numFilas, 9).getValues();
  const fila = filas.find(function (f) {
    return String(f[5]).trim().toLowerCase() === email;
  });

  if (!fila) {
    return respuesta({ ok: true, socio: null });
  }

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

// Número de socio autoincremental. Calcúlase buscando o maior número xa
// presente na columna "Nº socio" da propia folla (non un contador á parte
// nas Propiedades do script), así que se borras filas de proba o seguinte
// número reutiliza ese oco en vez de quedar disparado para sempre.
function seguinteNumeroSocio(hoja) {
  const numFilas = hoja.getLastRow() - 1; // sen cabeceira
  if (numFilas <= 0) return 1;

  const valores = hoja.getRange(2, 1, numFilas, 1).getValues();
  let maximo = 0;
  valores.forEach(function (fila) {
    const numero = Number(fila[0]);
    if (!isNaN(numero) && numero > maximo) maximo = numero;
  });
  return maximo + 1;
}

function obtenerOCrearHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(NOMBRE_HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(NOMBRE_HOJA);
  }
  if (hoja.getLastRow() === 0) {
    hoja.appendRow([
      "Nº socio",
      "Data alta",
      "Data de baixa",
      "Nome",
      "Nome completo",
      "Email",
      "Cota",
      "Prezo",
      "Estado"
    ]);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function respuesta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ALTA DE SOCIOS - CASCARILLA TECH
 * ---------------------------------
 * Backend do formulario en https://cascarillatech.org/registration (src/pages/registration.astro).
 * Este script pégase en Extensións > Apps Script dentro dun Google Sheet.
 * Ao desplegalo como "Web App" dá unha URL á que o formulario HTML envía os
 * datos por POST. Non fai falla backend propio.
 *
 * PASOS PARA DESPLEGAR:
 * 1. Crea un Google Sheet novo (ou usa un existente).
 * 2. Extensións > Apps Script. Borra o contido de Code.gs e pega isto.
 * 3. Garda (icona disco). Dálle un nome ao proxecto, p.ex. "Alta socios".
 * 4. Botón "Implementar" > "Nova implementación".
 *    - Tipo: "Aplicación web"
 *    - Executar como: "Ti" (a túa conta)
 *    - Quen ten acceso: "Calquera usuario"
 * 5. Autoriza os permisos que pida Google (é o teu propio script, o aviso é normal).
 * 6. Copia a URL que dá ("URL da aplicación web"). Esa é a que vai en
 *    src/pages/registration.astro na constante SCRIPT_URL.
 *
 * Cada vez que cambies este código, terás que crear unha NOVA implementación
 * (ou "Xestionar implementacións" > editar) para que os cambios teñan efecto.
 *
 * Os prezos e nomes das cotas veñen de src/content/membership/cuotas.md — se
 * cambian alí, cambia tamén PRECIOS_MEMBRESIA aquí embaixo para que coincidan
 * (este script non pode ler o .md do repo, é independente del).
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

    return respuesta({ ok: true, numeroSocio });
  } catch (err) {
    return respuesta({ ok: false, error: err.message });
  } finally {
    lock.releaseLock();
  }
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

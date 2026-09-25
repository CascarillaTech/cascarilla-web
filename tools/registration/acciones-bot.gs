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
 * Accións dispoñibles (engadir aquí as novas a medida que o bot medre):
 *
 *   ?token=...&email=...   → consulta se ESE email é socio (consultar_socio)
 *   ?token=...&estado=...  → lista socios con ESE Estado exacto (listar_socios)
 *                             "Pendente" / "Pendente ingreso" / "Confirmado".
 *                             Só devolve nome, nome completo e estado — sen
 *                             email nin cota, porque esta consulta está
 *                             aberta a calquera que escriba ao bot, non só
 *                             á propia persoa.
 */

function doGet(e) {
  const tokenEsperado = PropertiesService.getScriptProperties().getProperty("BOT_TOKEN");
  const tokenRecibido = e.parameter.token;
  if (!tokenEsperado || tokenRecibido !== tokenEsperado) {
    return respuesta({ ok: false, error: "Non autorizado." });
  }

  const email = (e.parameter.email || "").trim().toLowerCase();
  const estado = (e.parameter.estado || "").trim();

  if (!email && !estado) {
    return respuesta({ ok: false, error: "Fai falla o parámetro email ou estado." });
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

  // Listaxe por estado
  if (numFilas <= 0) return respuesta({ ok: true, socios: [] });

  const filas = hoja.getRange(2, 1, numFilas, 9).getValues();
  const socios = filas
    .filter(function (f) { return String(f[8]).trim() === estado; })
    .map(function (f) {
      return { nombre: f[3], nombre_completo: f[4], estado: f[8] };
    });

  return respuesta({ ok: true, socios: socios });
}

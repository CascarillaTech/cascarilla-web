/**
 * CORREOS DE SOCIOS - CASCARILLA TECH
 * ------------------------------------
 * Vive no MESMO proxecto de Apps Script que alta.gs (comparten Propiedades
 * do script e funcións globais — Apps Script trata tódolos ficheiros .gs
 * dun proxecto coma un só ámbito).
 *
 * Correo "DATOS" — o único automático — mándao alta.gs (doPost) directamente
 * en canto alguén envía o formulario público, chamando a
 * enviarCorreoDesdeDraft() definida aquí embaixo.
 *
 * Os outros dous xestiónaos este ficheiro, a man, cando cambias o Estado
 * dunha fila na folla "Socios":
 *
 *   Pendente → Pendente ingreso   → prepara correo "ALTA" (cota/prezo)
 *   Pendente ingreso → Confirmado → prepara correo "BENVIDA" (nº de socio)
 *
 * Ao cambiar o Estado, marca un checkbox na columna "Confirmar" (K). Ao
 * marcalo, busca un BORRADOR de Gmail co asunto exacto configurado
 * (ASUNTO_DRAFT_*), substitúe os marcadores {{...}} no seu corpo HTML, e
 * envíao co asunto real (TITULO_EMAIL_*).
 *
 * Require este trigger instalable (Editor > Disparadores > Engadir
 * disparador): función onEditInstalable, evento "Ao editar".
 *
 * Propiedades do script necesarias (Configuración do proxecto):
 *   SHEET_NAME                — nome da folla, "Socios"
 *   EMAIL_ADMIN                — a quen avisar se algo falla
 *   ASUNTO_DRAFT_DATOS         — asunto do borrador de Gmail do correo DATOS ("Confirmacion")
 *   ASUNTO_DRAFT_CONFIRMACION  — asunto do borrador de Gmail do correo ALTA
 *   ASUNTO_DRAFT_BENVIDA       — asunto do borrador de Gmail do correo BENVIDA
 *   TITULO_EMAIL_DATOS         — asunto real co que se envía o correo DATOS
 *   TITULO_EMAIL_ALTA          — asunto real co que se envía o correo ALTA
 *   TITULO_EMAIL_BENVIDA       — asunto real co que se envía o correo BENVIDA
 */

// ===== CONFIGURACIÓN (desde Propiedades del script) =====
const props = PropertiesService.getScriptProperties();

const SHEET_NAME = props.getProperty('SHEET_NAME');
const EMAIL_ADMIN = props.getProperty('EMAIL_ADMIN');
const ASUNTO_DRAFT_DATOS = props.getProperty('ASUNTO_DRAFT_DATOS'); // "Confirmacion" (para buscar el borrador)
const ASUNTO_DRAFT_CONFIRMACION = props.getProperty('ASUNTO_DRAFT_CONFIRMACION'); // "Alta" (para buscar el borrador)
const ASUNTO_DRAFT_BENVIDA = props.getProperty('ASUNTO_DRAFT_BENVIDA'); // "Benvida" (para buscar el borrador)
const TITULO_EMAIL_DATOS = props.getProperty('TITULO_EMAIL_DATOS'); // asunto real del correo
const TITULO_EMAIL_ALTA = props.getProperty('TITULO_EMAIL_ALTA'); // asunto real del correo
const TITULO_EMAIL_BENVIDA = props.getProperty('TITULO_EMAIL_BENVIDA'); // asunto real del correo

const COL_ESTADO = 9;
const COL_ENVIO_PENDIENTE = 10;
const COL_CONFIRMAR = 11;
const COL_MENSAJE = 12; // columna L

// ===== TRIGGER INSTALABLE =====
function onEditInstalable(e) {
  const range = e.range;
  const sheet = range.getSheet();

  if (sheet.getName() !== SHEET_NAME) return;

  const row = range.getRow();
  if (row === 1) return;

  const col = range.getColumn();

  if (col === COL_ESTADO) {
    manejarCambioEstado(e, sheet, row);
  } else if (col === COL_CONFIRMAR) {
    manejarClicConfirmar(sheet, row);
  }
}

function manejarCambioEstado(e, sheet, row) {
  const estadoAnterior = e.oldValue ? e.oldValue.trim() : '';
  const estadoNuevo = e.value ? e.value.trim() : '';

  const datos = sheet.getRange(row, 1, 1, 9).getValues()[0];
  const [numSocio, dataAlta, dataBaixa, nome, nomeCompleto, email, cota, prezo, estado] = datos;

  if (!email) {
    avisarAdmin(`Fila ${row}: cambio de estado a "${estadoNuevo}" pero no hay email.`);
    return;
  }

  let tipoCorreo = null;

  if (estadoAnterior === 'Pendente' && estadoNuevo === 'Pendente ingreso') {
    tipoCorreo = 'ALTA';
  } else if (estadoAnterior === 'Pendente ingreso' && estadoNuevo === 'Confirmado') {
    tipoCorreo = 'BENVIDA';
  } else {
    avisarAdmin(
      `Fila ${row} (${nome}, ${email}): estado cambió de "${estadoAnterior}" a "${estadoNuevo}", ` +
      `transición no esperada. No se marcó ningún envío.`
    );
    return;
  }

  sheet.getRange(row, COL_ENVIO_PENDIENTE).setValue(tipoCorreo);

  const celdaCheckbox = sheet.getRange(row, COL_CONFIRMAR);
  celdaCheckbox.insertCheckboxes();
  celdaCheckbox.setValue(false);

  sheet.getRange(row, COL_MENSAJE).setValue('');
}

function manejarClicConfirmar(sheet, row) {
  const valorCheckbox = sheet.getRange(row, COL_CONFIRMAR).getValue();
  if (valorCheckbox !== true) return;

  const celdaMensaje = sheet.getRange(row, COL_MENSAJE);

  const fila = sheet.getRange(row, 1, 1, 10).getValues()[0];
  const [numSocio, dataAlta, dataBaixa, nome, nomeCompleto, email, cota, prezo, estado, pendiente] = fila;

  if (!pendiente) {
    sheet.getRange(row, COL_CONFIRMAR).setValue(false);
    celdaMensaje.setValue('No hay ningún correo pendiente en esta fila.');
    return;
  }

  if (!email) {
    sheet.getRange(row, COL_CONFIRMAR).setValue(false);
    celdaMensaje.setValue('Error: no hay email en esta fila.');
    return;
  }

  celdaMensaje.setValue('Enviando...');
  SpreadsheetApp.flush();

  try {
    let asuntoUsado;

    if (pendiente === 'ALTA') {
      asuntoUsado = enviarCorreoDesdeDraft(ASUNTO_DRAFT_CONFIRMACION, TITULO_EMAIL_ALTA, email, {
        '{{nome}}': nome,
        '{{nome_completo}}': nomeCompleto,
        '{{cota}}': cota,
        '{{prezo}}': prezo
      });
    } else if (pendiente === 'BENVIDA') {
      asuntoUsado = enviarCorreoDesdeDraft(ASUNTO_DRAFT_BENVIDA, TITULO_EMAIL_BENVIDA, email, {
        '{{nome}}': nome,
        '{{numero_socio}}': numSocio
      });
    }

    sheet.getRange(row, COL_ENVIO_PENDIENTE).setValue('');
    sheet.getRange(row, COL_CONFIRMAR).clearDataValidations().setValue('');

    const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
    celdaMensaje.setValue(`Mensaje enviado a ${email} el ${fecha} — "${asuntoUsado}"`);

  } catch (err) {
    sheet.getRange(row, COL_CONFIRMAR).setValue(false);
    celdaMensaje.setValue(`Error al enviar: ${err.message}`);
    avisarAdmin(`Error al enviar correo a ${email} (fila ${row}): ${err.message}`);
  }
}

// ===== ENVÍO DESDE BORRADOR DE GMAIL (con imágenes inline) =====
function enviarCorreoDesdeDraft(asuntoDraft, tituloEmail, destinatario, sustituciones) {
  const drafts = GmailApp.getDrafts();
  const draft = drafts.find(d => d.getMessage().getSubject().trim() === asuntoDraft);

  if (!draft) {
    throw new Error(`No se encontró ningún borrador con el asunto exacto "${asuntoDraft}".`);
  }

  const mensaje = draft.getMessage();
  let cuerpoHtml = mensaje.getBody();

  Object.keys(sustituciones).forEach(marcador => {
    const regex = new RegExp(escapeRegExp(marcador), 'g');
    cuerpoHtml = cuerpoHtml.replace(regex, sustituciones[marcador]);
  });

  const inlineImages = obtenerImagenesInline(mensaje);

  const opciones = { htmlBody: cuerpoHtml };
  if (Object.keys(inlineImages).length > 0) {
    opciones.inlineImages = inlineImages;
  }

  GmailApp.sendEmail(destinatario, tituloEmail, '', opciones);

  return tituloEmail;
}

function obtenerImagenesInline(mensaje) {
  const inlineImages = {};
  try {
    const raw = mensaje.getRawContent();
    const attachments = mensaje.getAttachments({ includeInlineImages: true, includeAttachments: false });

    if (attachments.length === 0) return inlineImages;

    const cidMatches = [...raw.matchAll(/Content-ID:\s*<([^>]+)>/gi)];

    attachments.forEach((att, i) => {
      if (cidMatches[i]) {
        const cid = cidMatches[i][1];
        inlineImages[cid] = att.copyBlob();
      }
    });
  } catch (err) {
    Logger.log('No se pudieron extraer imágenes inline: ' + err);
  }

  return inlineImages;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function avisarAdmin(mensaje) {
  MailApp.sendEmail(EMAIL_ADMIN, '⚠️ Aviso: cambio de estado no gestionado automáticamente', mensaje);
}

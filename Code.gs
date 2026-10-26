/**
 * Diario de Apnea — Google Sheets bridge
 *
 * 1) Create a Google Sheet and paste its ID into SPREADSHEET_ID.
 * 2) Set a private random token in API_TOKEN (at least 8 characters).
 * 3) Deploy as a Web App, executing as you, accessible to anyone.
 * 4) Enter the deployment URL and the same token in the app Settings.
 *
 * Keep the spreadsheet private. Do not publish API_TOKEN in the public
 * GitHub repository or paste it into the HTML source.
 */
const SPREADSHEET_ID = 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET';
const API_TOKEN = 'CAMBIA_ESTA_CLAVE_POR_UNA_CLAVE_LARGA_Y_ALEATORIA';

const TRIPS_SHEET = 'Jornadas';
const CATCHES_SHEET = 'Capturas';

const TRIP_HEADERS = [
  'id','fecha','zona','hora_entrada','duracion_min','visibilidad_categoria',
  'temperatura_agua_c','viento','direccion_viento','estado_mar','oleaje_m',
  'direccion_oleaje','cielo','luna','marea','viento_dia_anterior',
  'direccion_viento_dia_anterior','estado_mar_dia_anterior',
  'oleaje_dia_anterior_m','direccion_oleaje_dia_anterior','traje','fusil',
  'profundidad_pesca','profundidad_habitual_m','acciones_esporadicas',
  'observaciones','actividad_marina','especies_grandes_avistadas','numero_capturas','registro_json'
];
const CATCH_HEADERS = [
  'id_jornada','fecha','zona','especie','cantidad','peso_kg','talla_cm',
  'profundidad_captura_m','actividad','observaciones'
];

function doGet(e) {
  const params = (e && e.parameter) || {};
  const callback = String(params.callback || '');
  if (params.action !== 'load') return jsonp({ok:false,error:'Acción no válida'}, callback);
  if (!validToken_(params.token)) return jsonp({ok:false,error:'Clave incorrecta'}, callback);
  try {
    const sheet = getSheet_(TRIPS_SHEET, TRIP_HEADERS);
    const values = sheet.getDataRange().getValues();
    const trips = [];
    for (let i = 1; i < values.length; i++) {
      const raw = values[i][TRIP_HEADERS.length - 1];
      if (!raw) continue;
      try { trips.push(JSON.parse(raw)); } catch (err) {}
    }
    return jsonp({ok:true,trips:trips}, callback);
  } catch (err) {
    return jsonp({ok:false,error:String(err)}, callback);
  }
}

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    if (params.action !== 'save') return htmlResponse_('Acción no válida');
    if (!validToken_(params.token)) return htmlResponse_('Clave incorrecta');
    const body = JSON.parse(params.payload || '{}');
    const trips = Array.isArray(body.trips) ? body.trips : [];
    writeAll_(trips);
    return htmlResponse_('Guardado. Jornadas: ' + trips.length);
  } catch (err) {
    return htmlResponse_('Error: ' + String(err));
  }
}

function validToken_(token) {
  return Boolean(API_TOKEN && API_TOKEN !== 'CAMBIA_ESTA_CLAVE_POR_UNA_CLAVE_LARGA_Y_ALEATORIA'
    && String(token || '') === API_TOKEN);
}

function getSpreadsheet_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET') {
    throw new Error('Falta configurar SPREADSHEET_ID en Code.gs');
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet_(name, headers) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.getRange(1,1,1,headers.length).setValues([headers]);
  return sheet;
}

function writeAll_(trips) {
  const tripsSheet = getSheet_(TRIPS_SHEET, TRIP_HEADERS);
  const catchesSheet = getSheet_(CATCHES_SHEET, CATCH_HEADERS);
  const tripRows = [TRIP_HEADERS];
  const catchRows = [CATCH_HEADERS];

  trips.forEach(t => {
    const catches = Array.isArray(t.catches) ? t.catches : [];
    const row = [
      t.id || '', t.date || '', t.spot || '', t.start || '', t.duration ?? '',
      t.visibility || '', t.waterTemp ?? '', t.wind || '', t.windDir || '',
      t.sea || '', t.swell ?? '', t.swellDir || '', t.sky || '', t.moon || '',
      t.tide || '', t.prevWind || '', t.prevWindDir || '', t.prevSea || '',
      t.prevSwell ?? '', t.prevSwellDir || '', t.suit || '', t.gun || '',
      t.depthMode || '', t.depth ?? '', (t.sporadicActions || []).join(', '),
      t.notes || '', t.marineActivity || '', (t.largeSightings || []).join(', '), catches.length, JSON.stringify(t)
    ];
    tripRows.push(row);
    catches.forEach(c => catchRows.push([
      t.id || '', t.date || '', t.spot || '', c.species || '', c.count ?? '',
      c.weight ?? '', c.length ?? '', c.depth ?? '', c.activity || '', c.notes || ''
    ]));
  });

  replaceSheetData_(tripsSheet, tripRows);
  replaceSheetData_(catchesSheet, catchRows);
}

function replaceSheetData_(sheet, rows) {
  const oldRows = sheet.getLastRow();
  const oldCols = sheet.getLastColumn();
  if (oldRows > 0 && oldCols > 0) sheet.getRange(1,1,oldRows,oldCols).clearContent();
  if (rows.length) sheet.getRange(1,1,rows.length,rows[0].length).setValues(rows);
  sheet.setFrozenRows(1);
  sheet.getRange(1,1,1,rows[0].length).setFontWeight('bold');
  sheet.autoResizeColumns(1, rows[0].length);
}

function jsonp(data, callback) {
  const safeCallback = /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callback) ? callback : '';
  const body = safeCallback
    ? safeCallback + '(' + JSON.stringify(data).replace(/</g, '\\u003c') + ');'
    : '/* Falta un callback JSONP válido. */';
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function htmlResponse_(message) {
  const safe = String(message).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><p>' + safe + '</p>');
}

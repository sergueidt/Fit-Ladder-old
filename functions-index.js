// ════════════════════════════════════════════════════════
//  functions/index.js — Firebase Cloud Functions
//  Fit Ladder — Notificaciones Push
//
//  SETUP (una sola vez desde terminal):
//    npm install -g firebase-tools
//    firebase login
//    firebase init functions   (seleccionar proyecto fit-ladder-py)
//    cd functions && npm install
//    firebase deploy --only functions
// ════════════════════════════════════════════════════════

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
admin.initializeApp();

const db        = admin.firestore();
const messaging = admin.messaging();

// ── Helper: obtener todos los tokens FCM activos ──────────────────────────
async function obtenerTodosLosTokens() {
  const snap = await db.collection('fl_fcm_tokens').get();
  const tokens = [];
  snap.forEach(doc => {
    const t = doc.data().token;
    if (t) tokens.push(t);
  });
  return tokens;
}

// ── Helper: enviar a todos los tokens en lotes de 500 ────────────────────
async function enviarATodos(titulo, cuerpo, datos = {}) {
  const tokens = await obtenerTodosLosTokens();
  if (!tokens.length) return { enviados: 0 };

  const mensaje = {
    notification: { title: titulo, body: cuerpo },
    data: datos,
    android: { notification: { sound: 'default', channelId: 'fitladder_general' } },
    apns:    { payload: { aps: { sound: 'default', badge: 1 } } },
  };

  // FCM acepta máximo 500 tokens por lote
  const lotes = [];
  for (let i = 0; i < tokens.length; i += 500) {
    lotes.push(tokens.slice(i, i + 500));
  }

  let totalEnviados = 0;
  const tokensInvalidos = [];

  for (const lote of lotes) {
    const resp = await messaging.sendEachForMulticast({ ...mensaje, tokens: lote });
    totalEnviados += resp.successCount;

    // Detectar tokens inválidos para limpiarlos
    resp.responses.forEach((r, idx) => {
      if (!r.success) {
        const code = r.error?.code;
        if (
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/registration-token-not-registered'
        ) {
          tokensInvalidos.push(lote[idx]);
        }
      }
    });
  }

  // Limpiar tokens inválidos de Firestore
  if (tokensInvalidos.length) {
    const batch = db.batch();
    for (const token of tokensInvalidos) {
      const q = await db.collection('fl_fcm_tokens').where('token', '==', token).get();
      q.forEach(doc => batch.delete(doc.ref));
    }
    await batch.commit();
    console.log(`🧹 Tokens inválidos eliminados: ${tokensInvalidos.length}`);
  }

  console.log(`✅ Push enviado: ${totalEnviados}/${tokens.length}`);
  return { enviados: totalEnviados, total: tokens.length };
}

// ════════════════════════════════════════════════════════
//  FUNCIÓN 1: Aviso manual del admin
//  Se dispara cuando el admin escribe en fl_push_manual
// ════════════════════════════════════════════════════════
exports.pushManualAdmin = functions
  .region('us-central1')
  .firestore.document('fl_push_manual/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data || data.enviado) return null;

    const titulo = data.titulo || '🏋️ Fit Ladder';
    const cuerpo = data.cuerpo || '';
    if (!cuerpo) return null;

    const resultado = await enviarATodos(titulo, cuerpo, { tipo: 'manual' });

    // Marcar como enviado para no reenviar
    await snap.ref.update({
      enviado: true,
      enviadoEn: admin.firestore.FieldValue.serverTimestamp(),
      ...resultado,
    });

    return null;
  });

// ════════════════════════════════════════════════════════
//  FUNCIÓN 2: Nuevo benchmark publicado
//  Se dispara cuando se crea un doc en fl_benchmarks_pub
// ════════════════════════════════════════════════════════
exports.pushNuevoBenchmark = functions
  .region('us-central1')
  .firestore.document('fl_benchmarks_pub/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data || data.notificado) return null;

    const nombre = data.nombre || 'Nuevo benchmark';
    const tipo   = data.tipo   || '';
    const titulo = '🏆 Nuevo benchmark en Fit Ladder';
    const cuerpo = `${nombre}${tipo ? ' · ' + tipo : ''} — ¡Abrí la app y registrá tu marca!`;

    const resultado = await enviarATodos(titulo, cuerpo, {
      tipo:       'benchmark',
      benchmarkId: context.params.docId,
    });

    await snap.ref.update({
      notificado: true,
      notificadoEn: admin.firestore.FieldValue.serverTimestamp(),
      ...resultado,
    });

    return null;
  });

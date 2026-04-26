/**
 * Fit Ladder - Punto de Entrada Principal (main.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Fit Ladder inicializado...");

    // Verificar sesión de invitado activa
    if (typeof verificarInvitado === 'function' && verificarInvitado()) {
        console.log("Sesión de invitado activa");
        ocultarLogin();
        cargarModoInvitado();
    }
});

// --- CARGA DE DATOS DEL USUARIO ---
async function cargarDatosUsuario(uid) {
    try {
        const userDoc = await db.collection("usuarios").doc(uid).get();
        if (userDoc.exists) {
            const data = userDoc.data();
            actualizarInterfazUsuario(data);
            await cargarProgresos(uid);
            await cargarFeedComunidad();
        }
    } catch (error) {
        console.error("Error al cargar datos:", error);
    }
}

function actualizarInterfazUsuario(data) {
    const nombre = data.nombre || "Atleta";
    const email  = data.email  || "";

    // Iniciales para avatares
    const iniciales = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Top bar
    const topbarAvatar = document.getElementById('topbar-avatar');
    if (topbarAvatar) topbarAvatar.innerText = iniciales;

    // Drawer
    const drawerAvatar  = document.getElementById('drawer-avatar');
    const drawerNombre  = document.getElementById('drawer-nombre');
    const drawerEmail   = document.getElementById('drawer-email');
    if (drawerAvatar)  drawerAvatar.innerText  = iniciales;
    if (drawerNombre)  drawerNombre.innerText  = nombre;
    if (drawerEmail)   drawerEmail.innerText   = email;

    // Perfil
    const perfilAvatar = document.getElementById('perfil-avatar');
    const perfilNombre = document.getElementById('perfil-nombre');
    const perfilEmail  = document.getElementById('perfil-email');
    if (perfilAvatar)  perfilAvatar.innerText  = iniciales;
    if (perfilNombre)  perfilNombre.innerText  = nombre;
    if (perfilEmail)   perfilEmail.innerText   = email;

    // Dashboard bienvenida
    const bienvenida = document.getElementById('user-name-display');
    if (bienvenida) bienvenida.innerText = nombre;

    const puntos = document.getElementById('user-points');
    if (puntos) puntos.innerText = `${data.puntos || 0} PTS`;
}

// --- MÓDULO CUERPO: Guardar Peso ---
async function guardarPeso() {
    const peso = document.getElementById('peso-actual').value;
    const uid  = auth.currentUser ? auth.currentUser.uid : null;

    if (!uid)              return alert("Debes estar logueado para guardar datos.");
    if (!peso || peso <= 0) return alert("Ingresa un peso válido.");

    try {
        await db.collection("usuarios").doc(uid).collection("registros_peso").add({
            valor: parseFloat(peso),
            fecha: firebase.firestore.FieldValue.serverTimestamp()
        });

        const lastWeight = document.getElementById('last-weight');
        if (lastWeight) lastWeight.innerText = `${peso} kg`;

        alert("✅ Peso registrado con éxito.");
        document.getElementById('peso-actual').value = '';
    } catch (error) {
        console.error("Error al guardar peso:", error);
        alert("Error al guardar. Intenta de nuevo.");
    }
}

// --- MÓDULO ENTRENAMIENTO: Guardar PR/Benchmark ---
async function guardarPR(ejercicio, peso) {
    const uid = auth.currentUser ? auth.currentUser.uid : null;
    if (!uid) return;

    try {
        await db.collection("usuarios").doc(uid).collection("benchmarks").doc(ejercicio).set({
            peso: parseFloat(peso),
            fecha: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`PR de ${ejercicio} actualizado.`);
    } catch (error) {
        console.error("Error al guardar PR:", error);
    }
}

// --- MÓDULO NUTRICIÓN: Calorías Restantes ---
function calcularCalorias(meta, consumidas) {
    const restantes = meta - consumidas;
    const display = document.getElementById('cals-restantes');
    if (display) {
        display.innerText = restantes;
        display.style.color = restantes < 0 ? '#ef4444' : 'var(--blue)';
    }
}

// --- CARGA DE PROGRESO Y GRÁFICOS ---
async function cargarProgresos(uid) {
    try {
        const snapshot = await db.collection("usuarios").doc(uid)
            .collection("registros_peso")
            .orderBy("fecha", "desc")
            .limit(7)
            .get();

        const pesos  = [];
        const fechas = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            pesos.push(data.valor);
            fechas.push(new Date(data.fecha.seconds * 1000).toLocaleDateString('es-ES'));
        });

        if (pesos.length > 0) {
            renderizarGraficoProgreso('mainProgresoChart', fechas.reverse(), pesos.reverse());
        }
    } catch (error) {
        console.error("Error al cargar progresos:", error);
    }
}

// --- FEED COMUNIDAD ---
async function cargarFeedComunidad() {
    const feedContainer = document.getElementById('feed-social');
    if (!feedContainer) return;

    try {
        const posts = await db.collection("comunidad_feed")
            .orderBy("fecha", "desc")
            .limit(10)
            .get();

        feedContainer.innerHTML = '';

        if (posts.empty) {
            feedContainer.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px;">No hay publicaciones aún.</p>';
            return;
        }

        posts.forEach(post => {
            const data = post.data();
            const fecha = data.fecha ? new Date(data.fecha.seconds * 1000).toLocaleString('es-ES') : '';
            feedContainer.innerHTML += `
                <div class="card-glass" style="margin-bottom:12px;">
                    <div style="font-family:'Barlow',sans-serif;font-weight:700;font-size:16px;margin-bottom:6px;">${data.autor || 'Anónimo'}</div>
                    <p style="font-size:15px;color:var(--text);margin-bottom:8px;">${data.mensaje || ''}</p>
                    <small style="color:var(--muted);font-size:13px;">${fecha}</small>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al cargar feed:", error);
    }
}

// --- CALCULADORA 1RM (Fórmula de Epley) ---
function calcular1RM() {
    const peso = parseFloat(document.getElementById('rm-peso').value);
    const reps = parseInt(document.getElementById('rm-reps').value);
    const resultadoDiv = document.getElementById('rm-resultado');

    if (!peso || !reps || peso <= 0 || reps <= 0) {
        return alert("Ingresa valores válidos.");
    }

    const rm = peso * (1 + (reps / 30));

    resultadoDiv.innerHTML = `
        <div class="card-glass" style="margin-top:16px;text-align:center;">
            <p style="color:var(--muted);font-size:14px;margin-bottom:4px;">TU 1RM ESTIMADO</p>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:52px;color:var(--blue);line-height:1;">${rm.toFixed(1)}</div>
            <div style="font-size:18px;color:var(--muted);">kg</div>
            <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                ${[90,80,70,60,50].map(pct => `
                    <div style="background:var(--bg3);border-radius:10px;padding:10px;text-align:center;">
                        <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--text);">${(rm * pct / 100).toFixed(1)}</div>
                        <div style="font-size:12px;color:var(--muted);">${pct}%</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// --- GRÁFICO DE PROGRESO ---
function renderizarGraficoProgreso(canvasId, labels, valores) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (window._chart) window._chart.destroy();

    window._chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Peso (kg)',
                data: valores,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#2563eb',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#6b7a99', font: { size: 11 } }, grid: { color: '#1e2d4a' } },
                y: { ticks: { color: '#6b7a99', font: { size: 11 } }, grid: { color: '#1e2d4a' } }
            }
        }
    });
}

// --- CRONÓMETRO ---
let timerInterval;
let seconds = 0;

function controlCronometro(accion) {
    const display = document.getElementById('timer-display');
    if (!display) return;

    if (accion === 'start') {
        if (timerInterval) return;
        timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            display.innerText = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        }, 1000);
    } else if (accion === 'stop') {
        clearInterval(timerInterval);
        timerInterval = null;
    } else if (accion === 'reset') {
        clearInterval(timerInterval);
        timerInterval = null;
        seconds = 0;
        display.innerText = "00:00";
    }
}

// Exponer al window
window.cargarDatosUsuario    = cargarDatosUsuario;
window.actualizarInterfazUsuario = actualizarInterfazUsuario;
window.guardarPeso           = guardarPeso;
window.guardarPR             = guardarPR;
window.calcularCalorias      = calcularCalorias;
window.calcular1RM           = calcular1RM;
window.controlCronometro     = controlCronometro;
window.cargarFeedComunidad   = cargarFeedComunidad;

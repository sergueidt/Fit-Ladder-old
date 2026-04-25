/**
 * Fit Ladder - Punto de Entrada Principal (main.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Fit Ladder inicializado...");

    // Verificar si hay sesión de invitado activa antes de esperar Firebase
    if (verificarInvitado()) {
        console.log("Sesión de invitado activa");
        ocultarLogin();
        cargarModoInvitado();
    }
    // Si no hay invitado, Firebase Auth toma el control desde auth.js
});

// --- CARGA DE DATOS DESDE FIRESTORE ---
async function cargarDatosUsuario(uid) {
    try {
        const userDoc = await db.collection("usuarios").doc(uid).get();
        if (userDoc.exists) {
            const data = userDoc.data();
            actualizarInterfazUsuario(data);
            cargarProgresos(uid);
        }
    } catch (error) {
        console.error("Error al cargar datos:", error);
    }
}

function actualizarInterfazUsuario(data) {
    const nombreElem = document.getElementById('user-name-display');
    if (nombreElem) nombreElem.innerText = data.nombre || "Atleta";

    const puntosElem = document.getElementById('user-points');
    if (puntosElem) puntosElem.innerText = `${data.puntos || 0} PTS`;
}

// --- LÓGICA DE ENTRENAMIENTO (Calculadora 1RM) ---
function calcular1RM() {
    const peso = parseFloat(document.getElementById('rm-peso').value);
    const reps = parseInt(document.getElementById('rm-reps').value);
    const resultadoDiv = document.getElementById('rm-resultado');

    if (peso > 0 && reps > 0) {
        const rm = peso * (1 + (reps / 30));
        resultadoDiv.innerHTML = `
            <div class="rm-card">
                <span>Tu 1RM estimado:</span>
                <h2>${rm.toFixed(1)} kg</h2>
            </div>
        `;
    } else {
        alert("Por favor, ingresa valores válidos.");
    }
}

// --- SISTEMA DE CRONÓMETRO ---
let timerInterval;
let seconds = 0;

function controlCronometro(accion) {
    const display = document.getElementById('timer-display');

    if (accion === 'start') {
        if (timerInterval) return;
        timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

// --- MANEJO DE GRÁFICOS ---
function renderizarGraficoProgreso(canvasId, labels, valores) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Progreso',
                data: valores,
                borderColor: '#2563eb',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Exponer funciones al window
window.calcular1RM = calcular1RM;
window.controlCronometro = controlCronometro;
window.cargarDatosUsuario = cargarDatosUsuario;
window.actualizarInterfazUsuario = actualizarInterfazUsuario;

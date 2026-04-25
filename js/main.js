/**
 * Fit Ladder - Punto de Entrada Principal (main.js)
 * Orquestador de lógica de entrenamiento, cálculos y carga de datos
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Fit Ladder inicializado...");
    // Inicializar tooltips o listeners globales si los tienes
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
    // Actualiza nombres y estadísticas en el Dashboard
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
        // Fórmula de Epley (la que usas en tu HTML original)
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

// --- MANEJO DE GRÁFICOS (Simple Wrapper) ---
function renderizarGraficoProgreso(canvasId, labels, valores) {
    // Aquí asumo que usas Chart.js como en tu archivo original
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

// Exponer funciones al window para los onclick del HTML
window.calcular1RM = calcular1RM;
window.controlCronometro = controlCronometro;
window.cargarDatosUsuario = cargarDatosUsuario;

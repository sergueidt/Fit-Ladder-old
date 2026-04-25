/**
 * Fit Ladder - Módulo de Interfaz y Navegación (ui-logic.js)
 */

// --- MANEJO DE PESTAÑAS (TABS) ---
function switchTab(tabId) {
    // 1. Ocultar todas las secciones
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // 2. Quitar estado activo de los botones de la navegación
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Mostrar la sección seleccionada
    const activeSection = document.getElementById(tabId);
    if (activeSection) {
        activeSection.classList.add('active');
        activeSection.style.display = 'block';
    }

    // 4. Marcar botón correspondiente como activo
    const activeBtn = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Feedback táctil simple
    if (window.navigator.vibrate) window.navigator.vibrate(5);
}

// --- MANEJO DE MODALES ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('fade-in');
        document.body.style.overflow = 'hidden'; // Evita scroll de fondo
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
        
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('fade-out');
            document.body.style.overflow = 'auto';
        }, 300); // Match con la duración de la animación CSS
    }
}

// --- CONTROL DE VISTA LOGIN VS APP ---
function mostrarLogin() {
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('app');
    
    if (loginScreen && mainApp) {
        loginScreen.style.display = 'flex';
        mainApp.style.display = 'none';
    }
}

function ocultarLogin() {
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('app');
    
    if (loginScreen && mainApp) {
        loginScreen.style.display = 'none';
        mainApp.style.display = 'block';
        // Por defecto, al entrar mostrar el Dashboard
        switchTab('tab-dashboard');
    }
}

// --- UTILIDADES DE INTERFAZ ---
function toggleDrawer() {
    const drawer = document.getElementById('drawer-nav');
    if (drawer) {
        drawer.classList.toggle('open');
    }
}

// Cerrar modales si se hace clic fuera del contenido
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeModal(event.target.id);
    }
};

// Hacer funciones disponibles para el HTML
window.switchTab = switchTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleDrawer = toggleDrawer;
window.mostrarLogin = mostrarLogin;
window.ocultarLogin = ocultarLogin;

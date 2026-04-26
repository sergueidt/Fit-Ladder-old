/**
 * Fit Ladder - Módulo de Interfaz y Navegación (ui-logic.js)
 */

// --- DRAWER ---
function toggleDrawer() {
    const drawer  = document.getElementById('drawer-nav');
    const overlay = document.getElementById('drawer-overlay');
    const isOpen  = drawer.classList.contains('open');

    if (isOpen) {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
    } else {
        drawer.classList.add('open');
        overlay.classList.add('active');
    }
}

function cerrarDrawer() {
    const drawer  = document.getElementById('drawer-nav');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer)  drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

// --- CAMBIO DE SECCIONES ---
function switchTab(tabId) {
    console.log("Cambiando a:", tabId);

    document.querySelectorAll('.tab-content').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    const target = document.getElementById(tabId);
    if (target) {
        target.style.display = 'block';
        target.classList.add('active');
        ejecutarCargasEspecificas(tabId);
    } else {
        console.warn("Sección no encontrada:", tabId);
    }

    // Actualizar nav items activos
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[onclick*="${tabId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Actualizar drawer items activos
    document.querySelectorAll('.drawer-item').forEach(item => item.classList.remove('active'));
    const activeDrawer = document.querySelector(`.drawer-item[onclick*="${tabId}"]`);
    if (activeDrawer) activeDrawer.classList.add('active');

    // Cerrar drawer si está abierto
    const drawer = document.getElementById('drawer-nav');
    if (drawer && drawer.classList.contains('open')) toggleDrawer();

    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
}

// --- CARGAS ESPECÍFICAS POR MÓDULO ---
function ejecutarCargasEspecificas(tabId) {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    switch(tabId) {
        case 'tab-dashboard':
            if (typeof cargarDatosUsuario === 'function') cargarDatosUsuario(uid);
            break;
        case 'tab-graficos':
            if (typeof cargarProgresos === 'function') cargarProgresos(uid);
            break;
        case 'tab-comunidad':
            if (typeof cargarFeedComunidad === 'function') cargarFeedComunidad();
            break;
    }
}

// --- LOGIN / APP ---
function mostrarLogin() {
    const login = document.getElementById('login-screen');
    const app   = document.getElementById('app');
    if (login) login.style.display = 'flex';
    if (app)   app.style.display   = 'none';
}

function ocultarLogin() {
    const login = document.getElementById('login-screen');
    const app   = document.getElementById('app');
    if (login) login.style.display = 'none';
    if (app) {
        app.style.display = 'block';
        lucide.createIcons();
        switchTab('tab-dashboard');
    }
}

// --- MODALES ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cerrar drawer al clicar overlay
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('drawer-overlay');
    if (overlay) overlay.addEventListener('click', toggleDrawer);
});

// Exponer globalmente
window.toggleDrawer  = toggleDrawer;
window.switchTab     = switchTab;
window.openModal     = openModal;
window.closeModal    = closeModal;
window.mostrarLogin  = mostrarLogin;
window.ocultarLogin  = ocultarLogin;

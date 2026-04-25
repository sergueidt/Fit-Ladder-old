/**
 * Fit Ladder - Módulo de Autenticación (auth.js)
 * Maneja Login, Registro, Estados de Sesión e Invitado
 */

// --- ESTADO DE SESIÓN ---
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("Sesión activa detectada.");
        ocultarLogin();
        await cargarDatosUsuario(user.uid);
    } else {
        console.log("No hay sesión. Manteniendo pantalla de login.");
        mostrarLogin();
    }
}, (error) => {
    console.error("Error de Firebase Auth:", error);
    mostrarLogin();
});

// --- FUNCIÓN LOGIN ---
async function iniciarSesion(email, pass) {
    const btn = document.getElementById('btn-login');
    const originalText = btn.innerText;

    try {
        btn.innerText = "Cargando...";
        btn.disabled = true;

        await auth.signInWithEmailAndPassword(email, pass);
        console.log("Inicio de sesión exitoso");

    } catch (error) {
        console.error("Error login:", error);
        alert("Error: " + obtenerMensajeError(error.code));
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// --- FUNCIÓN REGISTRO ---
async function registrarUsuario(email, pass, nombreCompleto) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        await db.collection("usuarios").doc(user.uid).set({
            nombre: nombreCompleto,
            email: email,
            fechaRegistro: firebase.firestore.FieldValue.serverTimestamp(),
            rol: "atleta",
            nivel: 1,
            puntos: 0
        });

        alert("¡Cuenta creada con éxito!");
    } catch (error) {
        alert("Error al registrar: " + obtenerMensajeError(error.code));
    }
}

// --- RECUPERAR CONTRASEÑA ---
async function resetearPassword(email) {
    if (!email) return alert("Ingresa tu email");
    try {
        await auth.sendPasswordResetEmail(email);
        alert("Email de recuperación enviado. Revisa tu spam.");
    } catch (error) {
        alert("Error: " + obtenerMensajeError(error.code));
    }
}

// --- CERRAR SESIÓN ---
function cerrarSesion() {
    // Limpiar sesión de invitado si existe
    localStorage.removeItem('fitladder_invitado_exp');
    localStorage.removeItem('fitladder_rol');

    auth.signOut().then(() => {
        location.reload();
    });
}

// --- ACCESO INVITADO (24H) ---
function accesoInvitado() {
    const ahora = new Date().getTime();
    const expiracion = ahora + (24 * 60 * 60 * 1000); // 24h en ms

    localStorage.setItem('fitladder_invitado_exp', expiracion);
    localStorage.setItem('fitladder_rol', 'invitado');

    ocultarLogin();
    cargarModoInvitado();
}

// --- VERIFICAR SESIÓN INVITADO ---
function verificarInvitado() {
    const exp = localStorage.getItem('fitladder_invitado_exp');
    if (exp) {
        const ahora = new Date().getTime();
        if (ahora < parseInt(exp)) {
            return true; // Sesión válida
        } else {
            localStorage.clear(); // Expiró
            return false;
        }
    }
    return false;
}

// --- MODO INVITADO: carga datos genéricos ---
function cargarModoInvitado() {
    actualizarInterfazUsuario({ nombre: "Invitado Temporal", puntos: 0 });

    // Banner de conversión (se inyecta en el app si existe el contenedor)
    const banner = document.getElementById('banner-invitado');
    if (banner) banner.style.display = 'flex';

    console.log("Modo invitado activo.");
}

// --- TRADUCTOR DE ERRORES FIREBASE ---
function obtenerMensajeError(code) {
    switch (code) {
        case 'auth/invalid-email': return "El correo electrónico no es válido.";
        case 'auth/user-not-found': return "No existe una cuenta con este correo.";
        case 'auth/wrong-password': return "Contraseña incorrecta.";
        case 'auth/email-already-in-use': return "Este correo ya está registrado.";
        case 'auth/weak-password': return "La contraseña debe tener al menos 6 caracteres.";
        default: return "Ocurrió un error inesperado. Inténtalo de nuevo.";
    }
}

// Exponer funciones al window
window.iniciarSesion = iniciarSesion;
window.registrarUsuario = registrarUsuario;
window.cerrarSesion = cerrarSesion;
window.resetearPassword = resetearPassword;
window.accesoInvitado = accesoInvitado;
window.verificarInvitado = verificarInvitado;

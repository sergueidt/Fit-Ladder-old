/**
 * Fit Ladder - Módulo de Autenticación (auth.js)
 * Maneja Login, Registro y Estados de Sesión
 */

// --- ESTADO DE SESIÓN ---
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("Usuario autenticado:", user.uid);
        // Aquí llamarás a la función para cargar datos del usuario desde Firestore
        if (typeof cargarDatosUsuario === 'function') {
            await cargarDatosUsuario(user.uid);
        }
        // Redirigir al dashboard si está en el login
        ocultarLogin(); 
    } else {
        console.log("No hay sesión activa.");
        mostrarLogin();
    }
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

// --- FUNCIÓN REGISTRO (Para el modelo SaaS) ---
async function registrarUsuario(email, pass, nombreCompleto) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        // Crear el documento inicial en Firestore para los 50 usuarios
        await db.collection("usuarios").doc(user.uid).set({
            nombre: nombreCompleto,
            email: email,
            fechaRegistro: firebase.firestore.FieldValue.serverTimestamp(),
            rol: "atleta", // Rol por defecto para el SaaS
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
    auth.signOut().then(() => {
        location.reload(); // Recarga para limpiar el estado de la app
    });
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

// Hacer las funciones disponibles globalmente para los botones HTML (onclick)
window.iniciarSesion = iniciarSesion;
window.registrarUsuario = registrarUsuario;
window.cerrarSesion = cerrarSesion;
window.resetearPassword = resetearPassword;

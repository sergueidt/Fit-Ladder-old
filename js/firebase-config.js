// Reemplaza estos valores con tus credenciales de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBeLq0vGbUjbJX5rDl78hQ-dvaNCB0h3q0",
  authDomain: "fit-ladder-py.firebaseapp.com",
  databaseURL: "https://fit-ladder-py-default-rtdb.firebaseio.com",
  projectId: "fit-ladder-py",
  storageBucket: "fit-ladder-py.firebasestorage.app",
  messagingSenderId: "1089939861001",
  appId: "1:1089939861001:web:35b669d3cdc03bf090d2d8"
}

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Configuración de EmailJS (Extraída de tu código)
const EMAILJS_SERVICE_ID = "service_tbndzqi";
const EMAILJS_TEMPLATE_ID = "template_1hs0gmq";

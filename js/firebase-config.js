// Reemplaza estos valores con tus credenciales de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "fit-ladder.firebaseapp.com",
  projectId: "fit-ladder",
  storageBucket: "fit-ladder.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Configuración de EmailJS (Extraída de tu código)
const EMAILJS_SERVICE_ID = "service_tbndzqi";
const EMAILJS_TEMPLATE_ID = "template_1hs0gmq";

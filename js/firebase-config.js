// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeLq0vGbUjbJX5rDl78hQ-dvaNCB0h3q0",
  authDomain: "fit-ladder-py.firebaseapp.com",
  databaseURL: "https://fit-ladder-py-default-rtdb.firebaseio.com",
  projectId: "fit-ladder-py",
  storageBucket: "fit-ladder-py.firebasestorage.app",
  messagingSenderId: "1089939861001",
  appId: "1:1089939861001:web:35b669d3cdc03bf090d2d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

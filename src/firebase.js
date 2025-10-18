// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBlH2dUsvCqH_WJeJtOd0jJDEoz28DFSuI",
    authDomain: "gameon-e4b75.firebaseapp.com",
    projectId: "gameon-e4b75",
    storageBucket: "gameon-e4b75.firebasestorage.app",
    messagingSenderId: "629150525535",
    appId: "1:629150525535:web:fdc386a862d95b940a93ea",
    measurementId: "G-RJQ7ZGHP6V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

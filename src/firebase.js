// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// (Ýsteðe baðlý) tarayýcýda analytics kullanacaksan:
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBlH2dUsvCqH_WJeJtOd0jJDEoz28DFSuI",
    authDomain: "gameon-e4b75.firebaseapp.com",
    projectId: "gameon-e4b75",
    storageBucket: "gameon-e4b75.firebasestorage.app",
    messagingSenderId: "629150525535",
    appId: "1:629150525535:web:fdc386a862d95b940a93ea",
    measurementId: "G-RJQ7ZGHP6V",
};

const app = initializeApp(firebaseConfig);

// Firestore instance
export const db = getFirestore(app);

// (Opsiyonel) Analytics — SSR ortamýnda patlamamasý için korumalý:
isSupported()
    .then((ok) => {
        if (ok) getAnalytics(app);
    })
    .catch(() => { });

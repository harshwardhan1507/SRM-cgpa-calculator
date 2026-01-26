import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyA4cGV8jv51kf4vGMZcSi4UTTj_WX7Zank",
  authDomain: "srm-cgpa-calculator.firebaseapp.com",
  projectId: "srm-cgpa-calculator",
  storageBucket: "srm-cgpa-calculator.firebasestorage.app",
  messagingSenderId: "611795800579",
  appId: "1:611795800579:web:2ef78c63167dd6027e3436",
  measurementId: "G-085RZ7XM54"
};

const app = initializeApp(firebaseConfig);

// 🔹 expose globally (IMPORTANT)
window.firebaseAuth = getAuth(app);
window.firebaseDb = getFirestore(app);

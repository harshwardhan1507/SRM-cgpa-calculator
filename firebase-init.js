import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyA4cGV8jv51kf4vGMZcSi4UTTj_WX7Zank",
  authDomain: "srm-cgpa-calculator.firebaseapp.com",
  projectId: "srm-cgpa-calculator",
  storageBucket: "srm-cgpa-calculator.appspot.com",
  messagingSenderId: "611795800579",
  appId: "1:611795800579:web:2ef78c63167dd6027e3436"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

window.firebaseAuth = getAuth(app);
window.firebaseDb = getFirestore(app);

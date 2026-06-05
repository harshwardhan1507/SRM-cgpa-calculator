import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4cGV8jv51kf4vGMZcSi4UTTj_WX7Zank",
  authDomain: "srm-cgpa-calculator.firebaseapp.com",
  projectId: "srm-cgpa-calculator",
  storageBucket: "srm-cgpa-calculator.appspot.com",
  messagingSenderId: "611795800579",
  appId: "1:611795800579:web:2ef78c63167dd6027e3436",
};

// Prevent re-initialization in dev with hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxr0_knVTysIKXjYUJsNl0G9XJmAaxklQ",
  authDomain: "the-car-clinic-rx-5e7f4.firebaseapp.com",
  projectId: "the-car-clinic-rx-5e7f4",
  storageBucket: "the-car-clinic-rx-5e7f4.firebasestorage.app",
  messagingSenderId: "663254127109",
  appId: "1:663254127109:web:66b5834f0450399a28c26c",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

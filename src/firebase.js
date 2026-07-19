import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxr0_knVTysIKXjYUJsNl0G9XJmAaxklQ",
  authDomain: "the-car-clinic-rx-5e7f4.firebaseapp.com",
  projectId: "the-car-clinic-rx-5e7f4",
  storageBucket: "the-car-clinic-rx-5e7f4.firebasestorage.app",
  messagingSenderId: "663254127109",
  appId: "1:663254127109:web:66b5834f0450399a28c26c",
};

export const app = initializeApp(firebaseConfig);

// experimentalAutoDetectLongPolling helps the connection work reliably
// on mobile networks/carriers that block Firestore's default streaming connection.
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});

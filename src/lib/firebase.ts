import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCcR9K50jJNA4gjGkDvBhXL0tYO_STVEkE",
  authDomain: "enki-89357.firebaseapp.com",
  projectId: "enki-89357",
  storageBucket: "enki-89357.firebasestorage.app",
  messagingSenderId: "694907327367",
  appId: "1:694907327367:web:84209074fe0ebab6293922",
  measurementId: "G-EVW611MNT4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Conectar aos emuladores se estiver em localhost
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
  console.log("🚀 Conectado aos Emuladores Firebase");
}

export { app, auth, db, storage, googleProvider };

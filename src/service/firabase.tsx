
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAPUpIDWAI4FoC48gmd_KbgBO4f-bt272w",
  authDomain: "webcars-2f9cc.firebaseapp.com",
  projectId: "webcars-2f9cc",
  storageBucket: "webcars-2f9cc.appspot.com",
  messagingSenderId: "94933477572",
  appId: "1:94933477572:web:ab285dd8d8e1d4e7c6c191"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app)
const auth = getAuth(app);
const storage = getStorage(app);

export {db, auth, storage};

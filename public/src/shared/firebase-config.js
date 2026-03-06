// public/src/shared/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, setDoc, 
    collection, getDocs, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAirrOkhdEmQuagRXtZ8OwF7VoniOSluoY",
  authDomain: "dreams-d1334.firebaseapp.com",
  projectId: "dreams-d1334",
  storageBucket: "dreams-d1334.firebasestorage.app",
  messagingSenderId: "601502828427",
  appId: "1:601502828427:web:0f80b48ad88970b08c118e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { doc, getDoc, setDoc, collection, getDocs, query, orderBy };
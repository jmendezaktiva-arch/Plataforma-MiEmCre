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

// INSTANCIA PRINCIPAL: Mantiene tu sesión activa como Jorge
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// INSTANCIA SECUNDARIA: Actúa como un "túnel" para crear usuarios sin afectar tu login
const secondaryApp = initializeApp(firebaseConfig, "SecondaryInstance");
export const secondaryAuth = getAuth(secondaryApp);

/**
 * MOTOR DE ACCESO INTELIGENTE (Prestige Core)
 * @param {string} itemType - Categoría: 'apps', 'cursos' o 'consultor'
 * @param {string} itemId - ID único del recurso (ej: 'process-designer', 'consolida-360-a')
 * @returns {Promise<boolean>} - True si tiene acceso o es gratuito
 */
export const checkAccess = async (itemType, itemId) => {
    const user = auth.currentUser;
    if (!user) return false;

    try {
        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // 1. Prioridad: Admins tienen acceso total (Trazabilidad de Rol)
            if (userData.rol === 'Admin') return true;

            // 2. Lógica de accesos adquiridos
            // Se espera una estructura en Firestore: accesos: { apps: [...], cursos: [...] }
            const misAccesos = userData.accesos || {};
            const tienePermiso = misAccesos[itemType]?.includes(itemId);

            return tienePermiso || false;
        }
        return false;
    } catch (error) {
        console.error("Error en validación de acceso quirúrgico:", error);
        return false;
    }
};

export { doc, getDoc, setDoc, collection, getDocs, query, orderBy };
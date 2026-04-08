// public/src/shared/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, setDoc, 
    collection, getDocs, query, orderBy, where 
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
            
            // 1. Prioridad: Admins tienen acceso total (Trazabilidad de Rol Resiliente)
            const userRol = (userData.rol || "").toLowerCase();
            if (userRol === 'admin' || userRol === 'administrador') return true;

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

export { doc, getDoc, setDoc, collection, getDocs, query, orderBy, where };

// ANCLAJE QUIRÚRGICO PARA DEBUGGING (localhost + panel Admin en producción)
// Nota: auth/db ya están en el bundle; esto solo facilita pruebas en consola (p. ej. getDoc del rol).
const isAdminPage =
    typeof location !== "undefined" &&
    (location.pathname.endsWith("/admin.html") || location.pathname.endsWith("admin.html"));
if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || isAdminPage) {
    window.auth = auth;
    window.db = db;
    if (isAdminPage && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
        console.log("🛠️ DREAMS DEBUG (Admin): window.auth y window.db disponibles para consola.");
    } else {
        console.log("🛠️ DREAMS DEBUG: Núcleo expuesto en window (auth, db).");
    }
}
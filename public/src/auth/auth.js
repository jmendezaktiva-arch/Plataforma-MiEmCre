//public/src/auth
import { auth, db, doc, getDoc } from '../shared/firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/**
 * CIERRE DE SESIÓN (LOGOUT): Finaliza la persistencia del token en Firebase.
 * TRACEABILIDAD: Al ejecutarse, el centinela onAuthStateChanged en app.js 
 * detectará el cambio y permitirá el acceso a la pantalla de Login.
 */
export const logout = async () => {
    try {
        await signOut(auth);
        console.log("🔓 Sesión cerrada. Retornando al control de acceso.");
    } catch (error) {
        console.error("🚨 Error de Trazabilidad en Logout:", error.message);
    }
};

// Diccionario de Redirección por Rol
const ROLE_REDIRECTS = {
    'Admin': '/admin.html',
    'Cliente': '/dashboard.html',
    'Capacitador': '/academia.html',
    'Consultor': '/consultoria.html'
};

export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await redirectByUserRole(user.uid);
    } catch (error) {
        console.error("Error en login:", error.message);
        alert("Credenciales incorrectas.");
    }
};

export const redirectByUserRole = async (uid) => {
    try {
        // Corregido: Apuntamos a la colección 'usuarios' según el blueprint
        const userDoc = await getDoc(doc(db, "usuarios", uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Normalización: Aseguramos que el rol siempre empiece con Mayúscula (ej: "cliente" -> "Cliente")
            const rawRole = userData.rol || '';
            const role = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
            
            // Verificación de existencia en el diccionario
            if (!ROLE_REDIRECTS[role]) {
                console.error(`Error de Trazabilidad: El rol '${rawRole}' no está mapeado en ROLE_REDIRECTS.`);
                alert("Acceso Restringido: Tu perfil tiene un rol no reconocido. Contacta al administrador.");
                return; // Detenemos la ejecución para evitar redirecciones erróneas
            }

            console.log(`Logueado con éxito. Rol: ${role}. Destino: ${ROLE_REDIRECTS[role]}`);
            window.location.href = ROLE_REDIRECTS[role];
        } else {
            alert("Acceso denegado: Tu usuario no tiene un perfil de rol configurado en Firestore.");
            console.error("Error: No existe documento en la colección 'usuarios' para el UID:", uid);
        }
    } catch (error) {
        alert("Error crítico al verificar permisos de usuario.");
        console.error("Detalle del error en Firestore:", error);
    }
};
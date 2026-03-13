//public/src/auth
import { auth, db, doc, getDoc } from '../shared/firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/**
 * RECUPERACIÓN DE CONTRASEÑA (RESET): Dispara el flujo de seguridad de Firebase.
 * TRACEABILIDAD: El correo llega desde el dominio institucional configurado en la consola.
 */
export const resetPassword = async (email) => {
    if (!email) {
        alert("Por favor, ingresa tu correo electrónico para enviarte el enlace.");
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        alert("✅ Enlace de recuperación enviado. Revisa tu correo institucional.");
    } catch (error) {
        console.error("🚨 Error en Reset de Contraseña:", error.message);
        if (error.code === 'auth/user-not-found') {
            alert("No existe una cuenta registrada con este correo.");
        } else {
            alert("Hubo un problema al enviar el enlace. Intenta más tarde.");
        }
    }
};

/**
 * CIERRE DE SESIÓN (LOGOUT): Finaliza la persistencia del token en Firebase.
 * TRACEABILIDAD: Al ejecutarse, el centinela onAuthStateChanged en app.js 
 * detectará el cambio y permitirá el acceso a la pantalla de Login.
 */
export const logout = async () => {
    try {
        await signOut(auth);
        // Limpieza de Trazabilidad: Aseguramos que el estado local del ecosistema se limpie por completo
        sessionStorage.clear(); 
        console.log("🔓 Sesión cerrada. Retornando al control de acceso.");
        // Redirección Determinística: Forzamos el regreso al Login sin depender del centinela
        window.location.href = '/index.html';
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
            
            // TRAZABILIDAD: Verificamos que el campo 'rol' exista antes de procesar
            if (!userData.rol) {
                throw new Error(`El documento del usuario existe pero no tiene el campo 'rol' definido.`);
            }

            // Normalización Robusta: Maneja espacios en blanco y variaciones de caja
            const cleanRole = userData.rol.trim();
            const roleKey = cleanRole.charAt(0).toUpperCase() + cleanRole.slice(1).toLowerCase();
            
            const targetPath = ROLE_REDIRECTS[roleKey];

            if (targetPath) {
                console.log(`🚀 Trazabilidad: Redirigiendo a [${roleKey}] -> ${targetPath}`);
                window.location.replace(targetPath); // .replace es más seguro para evitar bucles de "atrás"
            } else {
                console.warn(`⚠️ Rol no mapeado: '${cleanRole}'. Redirigiendo a vista segura.`);
                alert("Tu perfil está en proceso de configuración. Contacta a Soporte.");
                await signOut(auth); // Cerramos sesión por seguridad si el rol es inválido
            }
        } else {
            // Caso: El usuario existe en Auth pero no se creó su perfil en Firestore
            console.error(`❌ Error Crítico: No se encontró el expediente en /usuarios/${uid}`);
            alert("Error de Registro: Tu expediente de usuario no ha sido creado. Por favor, regístrate de nuevo o contacta al administrador.");
            await signOut(auth);
        }
    } catch (error) {
        alert("Error crítico al verificar permisos de usuario.");
        console.error("Detalle del error en Firestore:", error);
    }
};
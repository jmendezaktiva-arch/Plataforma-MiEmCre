/**
 * UserManager - Módulo de Administración de Identidades y Permisos
 * Alineado a la colección 'usuarios' 
 */

import { db } from '../shared/firebase-config.js';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const UserManager = {
    
    /**
     * Requisito (a, b): Alta de perfiles en Firestore
     * @param {string} uid - El UID generado por Firebase Auth
     * @param {Object} data - Datos del usuario (email, nombre, rol, empresa)
     */
    async createUserProfile(uid, data) {
        try {
            const userRef = doc(db, "usuarios", uid); // Uso de UID como key según captura
            const profileData = {
                email: data.email,
                rol: data.rol.toLowerCase(), // Normalización para coincidir con DB 
                nombre: data.nombre || '',
                empresa: data.empresa || 'Dreams Platform',
                status: 'activo',
                fechaCreacion: serverTimestamp(),
                // Requisito (c): Control de accesos al stock
                accesos: {
                    academia: data.cursos || [], // Array de IDs de cursos
                    apps: data.apps || [],       // Array de IDs de apps
                    consultorIA: data.ia || false
                },
                // Requisito (g): Expediente de progreso
                expediente: {
                    diagnosticos: [],
                    ultimoAcceso: null,
                    progresoGeneral: 0
                }
            };

            await setDoc(userRef, profileData);
            console.log(`✅ Perfil de ${data.email} creado en colección 'usuarios'.`);
        } catch (error) {
            console.error("🚨 Error al crear perfil:", error);
            throw error;
        }
    },

    /**
     * Requisito (c): Configurar accesos individuales
     */
    async updateAccess(uid, newAccess) {
        const userRef = doc(db, "usuarios", uid);
        return await updateDoc(userRef, {
            "accesos": newAccess,
            "ultimaModificacion": serverTimestamp()
        });
    }
};
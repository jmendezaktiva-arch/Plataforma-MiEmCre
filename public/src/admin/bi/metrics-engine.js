/**
 * MetricsEngine - Inteligencia de Negocio para Process Designer
 * Procesa fórmulas maestras: Punto de Equilibrio y ROI Publicitario.
 */

// TRACEABILIDAD: Subimos dos niveles para alcanzar la carpeta shared desde /bi/
import { db } from '../../shared/firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// public/src/admin/bi/metrics-engine.js
import { db } from '../../shared/firebase-config.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const MetricsEngine = {

    /**
     * TRACEABILIDAD: Motor de Resultados por Usuario (Ejes Dreams)
     * Recupera el estado de éxito del cliente en los 3 ejes del ecosistema.
     */
    async getUserPerformance(uid) {
        try {
            const userRef = doc(db, "usuarios", uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) return null;
            
            const data = userSnap.data();
            const expediente = data.expediente || {};
            const accesos = data.accesos || {};

            return {
                // EJE 1: ACADEMIA (Basado en progreso de Workbooks)
                academia: {
                    label: "Progreso Estratégico",
                    valor: expediente.progresoGeneral || 0,
                    dataset: [expediente.progresoGeneral || 0, 100 - (expediente.progresoGeneral || 0)],
                    color: "#957C3D" // Oro Prestige
                },
                // EJE 2: APPS (Nivel de digitalización operativa)
                apps: {
                    label: "Eficiencia Digital",
                    valor: accesos.apps?.length || 0,
                    // Comparamos apps contratadas vs total disponible (ej. 5)
                    dataset: [(accesos.apps?.length || 0), 5 - (accesos.apps?.length || 0)],
                    color: "#0F3460" // Midnight
                },
                // EJE 3: CONSULTORÍA (Hitos de proyecto)
                consultoria: {
                    label: "Avance de Proyectos",
                    status: expediente.servicios?.['coaching-consolida-360']?.status || "Diagnóstico",
                    valor: 35, // Ejemplo: Podríamos calcularlo basado en fases completadas
                    dataset: [35, 65],
                    color: "#2E7D32" // Verde Éxito
                }
            };
        } catch (error) {
            console.error("🚨 Error en Motor de Performance:", error);
            return null;
        }
    },

    /**
     * TRACEABILIDAD: Cálculos Financieros Core
     */
    calculateBreakEven(gastosFijos, margenPercent) {
        if (!margenPercent || margenPercent === 0) return 0;
        return gastosFijos / (margenPercent / 100);
    },

    async getGlobalAnalytics() {
        // Mantiene la lógica de Admin ya existente para no romper el panel de Jorge
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        let totalPuntoEquilibrio = 0;
        let totalClientesConDatos = 0;
        let popularidadApps = {};

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const pe = parseFloat(data.expediente?.finanzas?.puntoEquilibrio) || 0;
            if (pe > 0) {
                totalPuntoEquilibrio += pe;
                totalClientesConDatos++;
            }
            (data.accesos?.apps || []).forEach(app => {
                popularidadApps[app] = (popularidadApps[app] || 0) + 1;
            });
        });

        return {
            promedioPuntoEquilibrio: totalPuntoEquilibrio / (totalClientesConDatos || 1),
            totalClientes: querySnapshot.size,
            appMasPopular: Object.keys(popularidadApps).reduce((a, b) => popularidadApps[a] > popularidadApps[b] ? a : b, 'Ninguna')
        };
    }
};
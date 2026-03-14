/**
 * MetricsEngine - Inteligencia de Negocio para Process Designer
 * Procesa fórmulas maestras: Punto de Equilibrio y ROI Publicitario.
 */

// TRACEABILIDAD: Subimos dos niveles para alcanzar la carpeta shared desde /bi/
import { db } from '../../shared/firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const MetricsEngine = {

    /**
     * Calcula el Punto de Equilibrio Agregado
     * Fórmula: Ventas Necesarias = Gastos Fijos / Margen %
     */
    calculateBreakEven(gastosFijos, margenPercent) {
        if (!margenPercent || margenPercent === 0) return 0;
        const margenDecimal = margenPercent / 100;
        return gastosFijos / margenDecimal;
    },

    /**
     * Calcula el ROI Publicitario (Sesión B)
     * Fórmula: ((Ingresos - Inversión) / Inversión) * 100
     */
    calculateROI(ingresos, inversion) {
        if (!inversion || inversion === 0) return 0;
        return ((ingresos - inversion) / inversion) * 100;
    },

    /**
     * Obtiene métricas globales de todos los clientes para el Dashboard Admin
     */
    async getGlobalAnalytics() {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        let totalPuntoEquilibrio = 0;
        let totalClientesConDatos = 0;
        let popularidadApps = {};

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Extraemos datos de la Sesión C (Gasto Inteligente)
            const finanzas = data.respuestas?.sesion_c || {};
            
            if (finanzas.gastosFijos && finanzas.margen) {
                const pe = this.calculateBreakEven(finanzas.gastosFijos, finanzas.margen);
                totalPuntoEquilibrio += pe;
                totalClientesConDatos++;
            }

            // Medición de popularidad de Apps (Requisito e)
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
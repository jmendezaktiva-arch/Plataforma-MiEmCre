/**
 * DREAMS PLATFORM | Sidebar Prestige Component
 * Objetivo: Navegación minimalista con Logout Determinístico.
 */
import { logout } from '../auth/auth.js'; // TRACEABILIDAD: Importación del motor central de Auth

const SidebarPrestige = {
    init() {
        try {
            this.injectStyles();
            this.render();
            this.setupEventListeners();
        } catch (e) {
            // Log silencioso solo en caso de error crítico para no romper la trazabilidad
            console.error("🚨 DREAMS LOG: Error en Sidebar:", e);
        }
    },

    injectStyles() {
        if (!document.getElementById('sidebar-prestige-css')) {
            const link = document.createElement('link');
            link.id = 'sidebar-prestige-css';
            link.rel = 'stylesheet';
            // TRACEABILIDAD: Se elimina '/' inicial para compatibilidad con Localhost y Netlify
            link.href = 'assets/css/sidebar-prestige.css'; 
            document.head.appendChild(link);
        }
    },

    render() {
        const sidebarHTML = `
            <nav id="dreams-sidebar" class="sidebar-prestige sidebar-hidden">
                <div class="sidebar-nav">
                    <a href="javascript:history.back()" class="sidebar-link" title="Regresar">
                        <span class="label">← Regresar</span>
                    </a>
                    
                    <hr style="border: 0; border-top: 1px solid rgba(149, 124, 61, 0.2); margin: 20px 0;">

                    <a href="academia.html" class="sidebar-link">
                        <span class="label">Academia</span>
                    </a>
                    <a href="apps.html" class="sidebar-link">
                        <span class="label">Apps</span>
                    </a>
                    <a href="consultoria.html" class="sidebar-link">
                        <span class="label">Consultoría</span>
                    </a>

                    <a href="#" class="sidebar-link disabled" title="Desarrollo en curso">
                        <span class="label">Test de Salud</span>
                    </a>
                </div>

                <div class="sidebar-footer">
                    <button id="btn-logout-dreams" class="btn-logout-sidebar">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>
        `;
        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    },

    setupEventListeners() {
        const sidebar = document.getElementById('dreams-sidebar');
        const logoutBtn = document.getElementById('btn-logout-dreams');

        // Comportamiento de Despliegue Automático (Hover)
        sidebar.addEventListener('mouseenter', () => {
            sidebar.classList.remove('sidebar-hidden');
        });

        sidebar.addEventListener('mouseleave', () => {
            sidebar.classList.add('sidebar-hidden');
        });

        // Logout Determinístico (Sincronizado con Firebase)
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log("🚪 DREAMS LOG: Cerrando sesión en Firebase...");
            
            try {
                // 1. Limpieza de persistencia local
                sessionStorage.clear();
                localStorage.clear(); 
                
                // 2. Cierre de sesión real en Firebase (Evita el bucle de redirección)
                await logout(); 
                
                // TRACEABILIDAD: No es necesaria la redirección manual aquí, 
                // el 'onAuthStateChanged' en app.js lo detectará y enviará a index.html.
            } catch (error) {
                console.error("🚨 DREAMS LOG: Error en protocolo de salida:", error);
            }
        });
    }
};

// Autoejecución al cargar el DOM
document.addEventListener('DOMContentLoaded', () => SidebarPrestige.init());
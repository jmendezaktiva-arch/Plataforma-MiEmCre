/**
 * DREAMS PLATFORM | Sidebar Prestige Component
 * Objetivo: Navegación minimalista con Logout Determinístico.
 */
import { logout } from '../auth/auth.js';
import { auth, db, doc, getDoc } from './firebase-config.js'; // Conexión con el núcleo de identidad

const SidebarPrestige = {
    async init() {
        try {
            this.injectStyles();
            
            // TRACEABILIDAD: El Sentinel de Auth decide qué versión del Sidebar inyectar
            auth.onAuthStateChanged(async (user) => {
                let role = 'cliente'; 
                
                if (user) {
                    try {
                        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                        if (userDoc.exists()) {
                            // NORMALIZACIÓN QUIRÚRGICA: Evita fallos por mayúsculas o variaciones de nombre
                            const rawRole = (userDoc.data().rol || 'cliente').toLowerCase();
                            
                            // Mapeo de Superpoderes (God Mode)
                            if (rawRole === 'admin' || rawRole === 'administrador') {
                                role = 'admin';
                            } else {
                                role = 'cliente';
                            }
                        }
                    } catch (error) {
                        console.error("🚨 DREAMS LOG: Error recuperando identidad:", error);
                    }
                }
                
                console.log(`🎭 Modo de navegación: ${role.toUpperCase()}`);
                this.render(role); 
                this.setupAfterRender();
            });

        } catch (e) {
            console.error("🚨 DREAMS LOG: Error crítico en inicialización de Sidebar:", e);
        }
    },

    setupAfterRender() {
        if (window.initGlobalAssets) window.initGlobalAssets();
        this.setupEventListeners();
    },

    injectStyles() {
        if (!document.getElementById('sidebar-prestige-css')) {
            const link = document.createElement('link');
            link.id = 'sidebar-prestige-css';
            link.rel = 'stylesheet';
            link.href = 'assets/css/sidebar-prestige.css'; 
            document.head.appendChild(link);
        }
    },

    render(role) {
        // TRACEABILIDAD: Eliminamos sidebars previos si existen para evitar duplicidad en cambios de rol
        const oldSidebar = document.getElementById('dreams-sidebar');
        if (oldSidebar) oldSidebar.remove();

        const sidebarHTML = `
            <nav id="dreams-sidebar" class="sidebar-prestige sidebar-hidden">
                <div class="sidebar-brand-peek" title="Mi Empresa Crece">
                    <img data-asset="logo.png" alt="Marca">
                </div>

                <div class="sidebar-nav">
                    ${role === 'admin' ? `
                        <a href="admin.html" class="sidebar-link" style="border-left: 3px solid var(--accent-gold); background: rgba(149, 124, 61, 0.05);">
                            <span class="label" style="color: var(--accent-gold); font-weight: 700;">PANEL MAESTRO</span>
                        </a>
                        <hr style="border: 0; border-top: 1px solid rgba(149, 124, 61, 0.2); margin: 10px 0;">
                    ` : ''}

                    <a href="identidad.html" class="sidebar-link" style="border-left: 2px solid var(--accent-gold); margin-top: 5px; background: rgba(149, 124, 61, 0.03);">
                        <span class="label" style="font-weight: 600;">Nuestro ADN</span>
                    </a>

                    <a href="dashboard.html" class="sidebar-link">
                        <span class="label">Dashboard</span>
                    </a>
                    
                    <a href="academia.html" class="sidebar-link">
                        <span class="label">Academia</span>
                    </a>
                    <a href="apps.html" class="sidebar-link">
                        <span class="label">Apps</span>
                    </a>
                    <a href="consultoria.html" class="sidebar-link">
                        <span class="label">Consultoría</span>
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

        // TRACEABILIDAD: Sincronización de estado global para expansión de Workbooks
        const syncSidebarState = (isHidden) => {
            if (isHidden) {
                sidebar.classList.add('sidebar-hidden');
                document.body.classList.add('sidebar-is-collapsed');
            } else {
                sidebar.classList.remove('sidebar-hidden');
                document.body.classList.remove('sidebar-is-collapsed');
            }
        };

        // Estado inicial al renderizar (por defecto colapsado)
        syncSidebarState(true);

        sidebar.addEventListener('mouseenter', () => syncSidebarState(false));
        sidebar.addEventListener('mouseleave', () => syncSidebarState(true));

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
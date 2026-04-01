/**
 * Mi Empresa Crece PLATFORM | Sidebar Prestige Component
 * Objetivo: Navegación minimalista con Logout Determinístico.
 */
import { logout } from '../auth/auth.js';
// TRACEABILIDAD: Importamos el motor completo de Firestore para la extracción de ADN empresarial
import { auth, db, doc, getDoc, getDocs, collection, checkAccess } from './firebase-config.js'; 

let USER_STRATEGIC_CONTEXT = {};

const SidebarPrestige = {
    async init() {
        try {
            this.injectStyles();
            this.injectAIChatHTML(); // Inyección del contenedor global
            
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    // EXPOSICIÓN GLOBAL DEL MOTOR IA
                    window.startIAConsultant = () => this.openAIChat(user);
                    this.setupAIChatListeners();
                }
                let role = 'cliente';
                let name = 'Socio';

                if (user) {
                    try {
                        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            name = userData.nombre || user.displayName || 'Socio';
                            const rawRole = (userData.rol || 'cliente').toLowerCase();
                            role = (rawRole === 'admin' || rawRole === 'administrador') ? 'admin' : 'cliente';
                        }
                    } catch (error) {
                        console.error("🚨 DREAMS LOG: Error recuperando identidad:", error);
                    }
                }
                
                console.log(`🎭 Sesión activa: ${name} [${role.toUpperCase()}]`);
                this.render(role, name); 
                // TRACEABILIDAD: Sincronización del Header Aura (IA + Soporte)
                this.syncAuraHeader(user); 
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

    render(role, userName) {
        // TRACEABILIDAD: Eliminamos sidebars previos si existen para evitar duplicidad en cambios de rol
        const oldSidebar = document.getElementById('dreams-sidebar');
        if (oldSidebar) oldSidebar.remove();

        const sidebarHTML = `
            <nav id="dreams-sidebar" class="sidebar-prestige sidebar-hidden">
                <div class="sidebar-brand-peek" title="Mi Empresa Crece">
                    <img data-asset="logo.png" alt="Marca">
                </div>

                <div class="sidebar-user-identity">
                    <span class="user-greeting">Bienvenido,</span>
                    <span class="user-name">${userName}</span>
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
                    <a href="#" id="btn-sidebar-apps" class="sidebar-link">
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

        // DISPARADOR TÁCTIL (Móvil) y CLICK (Escritorio):
        const peekBtn = sidebar.querySelector('.sidebar-brand-peek');
        if (peekBtn) {
            peekBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita interferencias con otros elementos
                const isCurrentlyHidden = sidebar.classList.contains('sidebar-hidden');
                syncSidebarState(!isCurrentlyHidden);
            });
        }

        // LÓGICA DE ACCESO INTELIGENTE A APPS (Filtro Comercial)
        const btnApps = document.getElementById('btn-sidebar-apps');
        if (btnApps) {
            btnApps.addEventListener('click', async (e) => {
                e.preventDefault();
                const user = auth.currentUser;
                if (!user) return;

                // TRACEABILIDAD: Validamos acceso a cualquiera de las herramientas del ecosistema
                const hasCrm = await checkAccess('apps', 'app-crm');
                const hasErp = await checkAccess('apps', 'app-erp');
                const hasProcess = await checkAccess('apps', 'app-process');

                if (hasCrm || hasErp || hasProcess) {
                    console.log("🔓 ME Crece LOG: Acceso concedido a Apps.");
                    window.location.href = 'apps.html';
                } else {
                    // ESTRATEGIA DE CONVERSIÓN: Si no tiene acceso, abrimos el modal con contexto de ventas
                    console.warn("🔒 ME Crece LOG: Acceso restringido. Disparando protocolo comercial.");
                    window.postMessage({ 
                        type: 'OPEN_CONTACT_MODAL', 
                        data: { subject: 'Adquisición de Apps', context: 'sidebar_trigger' } 
                    }, '*');
                }
            });
        }

        // MANTENEMOS HOVER PARA ESCRITORIO (Solo si no es dispositivo táctil para evitar conflictos)
        if (window.matchMedia("(hover: hover)").matches) {
            sidebar.addEventListener('mouseenter', () => syncSidebarState(false));
            sidebar.addEventListener('mouseleave', () => syncSidebarState(true));
        }

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
    },

    injectAIChatHTML() {
        if (document.getElementById('ai-chat-container')) return;
        const chatHTML = `
            <div id="ai-chat-container" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 52, 96, 0.4); backdrop-filter: blur(15px); z-index:10000; align-items:center; justify-content:center;">
                <div style="background: rgba(255, 255, 255, 0.7); width: 90%; max-width: 500px; height: 80vh; border-radius: 24px; border: 0.5px solid rgba(149, 124, 61, 0.4); box-shadow: 0 20px 60px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; position: relative;">
                    <header style="padding: 25px; background: rgba(15, 52, 96, 0.05); border-bottom: 0.5px solid rgba(15, 52, 96, 0.1); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin:0; color: var(--primary-midnight); font-weight: 700; font-size: 1.1rem; letter-spacing: 0.5px;">CONSULTOR ESTRATÉGICO IA</h3>
                            <span style="font-size: 0.65rem; color: var(--accent-gold); font-weight: 700; text-transform: uppercase;">Powered by Dreams Intelligence</span>
                        </div>
                        <button onclick="document.getElementById('ai-chat-container').style.display='none'" style="background:none; border:none; font-size: 1.5rem; cursor:pointer; color: var(--primary-midnight); opacity: 0.5;">&times;</button>
                    </header>
                    <div id="ai-chat-messages" style="flex: 1; overflow-y: auto; padding: 25px; display: flex; flex-direction: column; gap: 20px; font-family: 'Montserrat'; font-weight: 300; font-size: 0.9rem; line-height: 1.6;"></div>
                    <footer style="padding: 20px; background: white; border-top: 0.5px solid rgba(0,0,0,0.05);">
                        <form id="ai-chat-form" style="display: flex; gap: 10px;">
                            <input type="text" id="ai-user-input" placeholder="Escribe tu consulta estratégica..." autocomplete="off" style="flex: 1; padding: 15px 20px; border-radius: 30px; border: 1px solid rgba(15, 52, 96, 0.1); font-family: 'Montserrat'; font-size: 0.85rem; outline: none; background: #f9f9f9;">
                            <button type="submit" style="background: var(--primary-midnight); color: white; border: none; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                <span style="transform: rotate(-45deg); margin-left: 4px; margin-top: -2px;">🚀</span>
                            </button>
                        </form>
                    </footer>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', chatHTML);
    },

    async openAIChat(user) {
        const chatContainer = document.getElementById('ai-chat-container');
        const chatMessages = document.getElementById('ai-chat-messages');
        chatContainer.style.display = 'flex';
        if (chatMessages.innerHTML !== "") return; // No re-cargar si ya hay chat

        try {
            chatMessages.innerHTML = `<div id="ai-loading-dna" style="font-size: 0.7rem; color: var(--accent-gold); font-style: italic;">Sincronizando expediente estratégico...</div>`;
            
            // Extracción de ADN
            const [profileSnap, workbooksSnap, dnaResponse] = await Promise.all([
                getDoc(doc(db, "usuarios", user.uid)),
                getDocs(collection(db, "usuarios", user.uid, "progreso_workbooks")),
                fetch('/src/shared/cultura-dna.json')
            ]);

            const workbookData = {};
            workbooksSnap.forEach(doc => workbookData[doc.id] = doc.data());
            const dnaData = await dnaResponse.json();
            const profileData = profileSnap.exists() ? profileSnap.data() : {};

            USER_STRATEGIC_CONTEXT = {
                usuario: { nombre: profileData.nombre || "Socio", empresa: profileData.empresa || "PyME", diagnosticos: workbookData },
                culturaInstitucional: dnaData
            };

            document.getElementById('ai-loading-dna').remove();
            chatMessages.innerHTML = `<div class="ai-bubble" style="align-self: flex-start; background: rgba(15, 52, 96, 0.05); padding: 15px 20px; border-radius: 0 18px 18px 18px; color: var(--primary-midnight); max-width: 85%;">
                Hola ${USER_STRATEGIC_CONTEXT.usuario.nombre}. ADN de ${USER_STRATEGIC_CONTEXT.usuario.empresa} sincronizado. ¿En qué pilar profundizamos hoy?
            </div>`;
        } catch (e) {
            console.error("🚨 Error IA Global:", e);
        }
    },

    setupAIChatListeners() {
        const form = document.getElementById('ai-chat-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const input = document.getElementById('ai-user-input');
            const chatMessages = document.getElementById('ai-chat-messages');
            const userMessage = input.value.trim();
            if (!userMessage) return;

            chatMessages.insertAdjacentHTML('beforeend', `<div style="align-self: flex-end; background: var(--primary-midnight); color: white; padding: 12px 18px; border-radius: 18px 0 18px 18px; font-size: 0.85rem; max-width: 80%;">${userMessage}</div>`);
            input.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            const typingId = 'ai-typing-' + Date.now();
            chatMessages.insertAdjacentHTML('beforeend', `<div id="${typingId}" style="font-size: 0.7rem; color: var(--accent-gold); font-style: italic;">Analizando...</div>`);

            const response = await fetch('/.netlify/functions/consultor-ia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMessage, userContext: USER_STRATEGIC_CONTEXT })
            });

            const data = await response.json();
            document.getElementById(typingId).remove();
            chatMessages.insertAdjacentHTML('beforeend', `<div style="align-self: flex-start; background: rgba(15, 52, 96, 0.05); padding: 15px 20px; border-radius: 0 18px 18px 18px; color: var(--primary-midnight); max-width: 85%; font-size: 0.85rem; border: 0.5px solid rgba(15, 52, 96, 0.1);">${data.text}</div>`);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };
    },

    async syncAuraHeader(user) {}
};

// Autoejecución al cargar el DOM
document.addEventListener('DOMContentLoaded', () => SidebarPrestige.init());
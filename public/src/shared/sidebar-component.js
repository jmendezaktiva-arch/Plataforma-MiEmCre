/**
 * Mi Empresa Crece PLATFORM | Sidebar Prestige Component
 * Objetivo: Navegación minimalista con Logout Determinístico.
 */
import { logout } from '../auth/auth.js';
// TRACEABILIDAD: Importación corregida para incluir setDoc (Necesario para Protocolo Comercial)
import { auth, db, doc, getDoc, getDocs, collection, checkAccess, setDoc } from './firebase-config.js';

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
                            const rawRole = (userData.rol || 'cliente').toLowerCase().trim();
                            
                            // TRACEABILIDAD: Normalización de roles para blindaje de interfaz
                            if (rawRole === 'admin' || rawRole === 'administrador') {
                                role = 'admin';
                            } else if (rawRole === 'consultor') {
                                role = 'consultor';
                            } else {
                                role = 'cliente';
                            }
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

                    ${role === 'consultor' ? `
                        <a href="consultor.html" class="sidebar-link">
                            <span class="label">Mis Asignaciones</span>
                        </a>
                    ` : `
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
                    `}
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
                    // PROTOCOLO COMERCIAL DIRECTO (REPLICA CONSULTORÍA)
                    console.warn("🔒 ME Crece LOG: Acceso restringido. Iniciando Protocolo de Adquisición.");
                    
                    const confirmar = confirm("¿Deseas solicitar la activación del Ecosistema de Apps y agendar tu sesión estratégica de implementación?");
                    if (!confirmar) return;

                    try {
                        const profileSnap = await getDoc(doc(db, "usuarios", user.uid));
                        const userData = profileSnap.exists() ? profileSnap.data() : {};
                        const nombreUsuario = userData.nombre || user.email.split('@')[0];

                        // 1. Registro comercial en colección permitida
                        const solicitudId = `sidebar_app_${Date.now()}`;
                        await setDoc(doc(db, "solicitudes_contacto", solicitudId), {
                            usuarioId: user.uid,
                            email: user.email,
                            nombre: nombreUsuario,
                            interes: "Ecosistema de Apps (Sidebar)",
                            servicioId: "apps-full-pack",
                            estado: "pendiente",
                            fechaEnvio: new Date().toISOString(),
                            canal: "Sidebar Prestige"
                        });

                        // 2. Disparo de Notificación (Netlify)
                        fetch('/.netlify/functions/intervencion-notificacion', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                destinatario: user.email,
                                cliente: { uid: user.uid, email: user.email, nombre: nombreUsuario },
                                servicio: { id: "apps-full-pack", titulo: "Ecosistema de Apps" },
                                tipo: 'CARRITO_COMPRA',
                                omitirRegistroFirestore: true 
                            })
                        });

                        // 3. Redirección Inmediata a Calendly
                        alert("🚀 Solicitud registrada con éxito.\n\nTe estamos redirigiendo a la agenda para que selecciones el horario de tu sesión técnica.");
                        window.location.href = 'agendar.html?service=apps';

                    } catch (error) {
                        console.error("🚨 Error en registro comercial:", error);
                        alert("Hubo un problema de conexión. Por favor, intenta desde el botón de soporte.");
                    }
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
            <div id="ai-chat-container" class="purpose-overlay" style="display: none;">
                <div class="purpose-bubble ai-consultant-bubble">
                    <button type="button" class="close-bubble" id="btn-close-ai-chat" aria-label="Cerrar consultor IA">&times;</button>
                    <header class="ai-consultant-bubble__head">
                        <h2>CONSULTOR ESTRATÉGICO IA</h2>
                        <span class="ai-consultant-bubble__sub">Powered by Dreams Intelligence</span>
                    </header>
                    <div id="ai-chat-messages" class="ai-consultant-bubble__messages"></div>
                    <footer class="ai-consultant-bubble__foot">
                        <form id="ai-chat-form" class="ai-consultant-bubble__form">
                            <input type="text" id="ai-user-input" placeholder="Escribe tu consulta estratégica..." autocomplete="off">
                            <button type="submit" aria-label="Enviar mensaje">
                                <span class="ai-send-glyph" aria-hidden="true">🚀</span>
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
        setTimeout(() => chatContainer.classList.add('active'), 10);
        if (chatMessages.innerHTML.trim() !== '') return;

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

            // MOTOR DE CONTEXTO VISUAL (DREAMS INTELLIGENCE)
            const path = window.location.pathname;
            let contextualWelcome = `Hola ${USER_STRATEGIC_CONTEXT.usuario.nombre}. ADN de ${USER_STRATEGIC_CONTEXT.usuario.empresa} sincronizado. ¿En qué pilar profundizamos hoy?`;

            if (path.includes('dashboard.html')) {
                contextualWelcome = `Bienvenido al Centro de Mando, ${USER_STRATEGIC_CONTEXT.usuario.nombre}. Tu expediente de ${USER_STRATEGIC_CONTEXT.usuario.empresa} está actualizado. ¿Deseas que analicemos tus indicadores de crecimiento o pasamos a la siguiente fase estratégica?`;
            } else if (path.includes('academia.html')) {
                contextualWelcome = `Hola ${USER_STRATEGIC_CONTEXT.usuario.nombre}. Estamos en el área de formación de ${USER_STRATEGIC_CONTEXT.usuario.empresa}. ¿Tienes alguna duda sobre los conceptos de la sesión actual o necesitas ayuda con los ejercicios del Workbook?`;
            } else if (path.includes('apps.html')) {
                contextualWelcome = `Control Operativo detectado. ${USER_STRATEGIC_CONTEXT.usuario.nombre}, ¿buscas optimizar algún proceso específico con nuestras Apps o necesitas apoyo para integrar una nueva herramienta en ${USER_STRATEGIC_CONTEXT.usuario.empresa}?`;
            } else if (path.includes('consultoria.html')) {
                contextualWelcome = `Protocolo de Alta Intervención activado. ${USER_STRATEGIC_CONTEXT.usuario.nombre}, estoy listo para profundizar en los cuellos de botella de ${USER_STRATEGIC_CONTEXT.usuario.empresa}. ¿En qué área de consultoría senior nos enfocaremos hoy?`;
            } else if (path.includes('identidad.html')) {
                contextualWelcome = `Explorando el ADN Institucional. ${USER_STRATEGIC_CONTEXT.usuario.nombre}, ¿necesitas ayuda para alinear los valores de tu equipo con el Propósito Maestro de ${USER_STRATEGIC_CONTEXT.usuario.empresa}?`;
            }

            chatMessages.innerHTML = `<div class="ai-bubble" style="align-self: flex-start; background: rgba(15, 52, 96, 0.05); padding: 15px 20px; border-radius: 0 18px 18px 18px; color: var(--primary-midnight); max-width: 85%; border: 0.5px solid rgba(15, 52, 96, 0.1);">
                ${contextualWelcome}
            </div>`;
        } catch (e) {
            console.error("🚨 Error IA Global:", e);
        }
    },

    setupAIChatListeners() {
        const chatContainer = document.getElementById('ai-chat-container');
        const btnCloseAi = document.getElementById('btn-close-ai-chat');
        if (btnCloseAi && chatContainer && btnCloseAi.dataset.prestigeCloseBound !== '1') {
            btnCloseAi.dataset.prestigeCloseBound = '1';
            btnCloseAi.addEventListener('click', () => {
                chatContainer.classList.remove('active');
                setTimeout(() => {
                    chatContainer.style.display = 'none';
                }, 400);
            });
        }

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
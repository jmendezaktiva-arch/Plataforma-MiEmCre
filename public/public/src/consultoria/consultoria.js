/**
 * DREAMS PLATFORM | Consultoría Prestige Controller
 * Objetivo: Gestionar la oferta de servicios y la activación del Consultor IA.
 */
import { db, auth, collection, getDocs, query, where, checkAccess, doc, getDoc } from '../shared/firebase-config.js';

let SERVICES_CONFIG = [];
let USER_STRATEGIC_CONTEXT = {}; // Trazabilidad: Almacén del ADN empresarial

document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.getElementById('consulting-products-list');

    /**
     * MOTOR DE CARGA: Sincronización con config_consultoria
     */
    const fetchServices = async () => {
        try {
            // Solo traemos servicios activos para los clientes
            const q = query(collection(db, "config_consultoria"), where("isActive", "==", true));
            const querySnapshot = await getDocs(q);
            
            const rawServices = [];
            querySnapshot.forEach((doc) => {
                rawServices.push({ id: doc.id, ...doc.data() });
            });

            // TRACEABILIDAD: Verificamos acceso para cada servicio (si aplica)
            SERVICES_CONFIG = await Promise.all(rawServices.map(async (service) => {
                const hasAccess = await checkAccess('consultoria', service.id);
                return { ...service, hasAccess };
            }));

            renderServices();
        } catch (error) {
            console.error("🚨 Dreams Cloud Error:", error);
            if (productsContainer) {
                // TRACEABILIDAD: Identificamos si el fallo es por falta de reglas en Firebase
                const isPermissionError = error.code === 'permission-denied';
                productsContainer.innerHTML = `
                    <div style="padding: 20px; border-radius: 12px; background: rgba(149, 124, 61, 0.05); border: 1px dashed var(--accent-gold); text-align: center;">
                        <p style="font-size: 0.8rem; color: #666; margin: 0;">
                            ${isPermissionError 
                                ? "🔒 <strong>Sincronizando seguridad...</strong><br>Estamos configurando el acceso a los servicios de consultoría. Intenta recargar en un momento." 
                                : "⚠️ No pudimos conectar con el catálogo de servicios en este momento."}
                        </p>
                    </div>`;
            }
        }
    };

    /**
     * MOTOR DE RENDERIZADO: Construcción de Tarjetas Staff
     */
    const renderServices = () => {
        if (!productsContainer) return;

        // Filtramos solo los que NO son tipo IA para el listado de Staff/Paquetes
        const staffServices = SERVICES_CONFIG.filter(s => s.type !== 'IA');

        if (staffServices.length === 0) {
            productsContainer.innerHTML = "<p style='font-size:0.8rem; color:#999;'>Próximamente nuevos paquetes de staff.</p>";
            return;
        }

        productsContainer.innerHTML = staffServices.map(service => `
            <div class="service-item" style="margin-bottom: 20px; padding: 15px; border-radius: 12px; background: rgba(15, 52, 96, 0.03); border: 1px solid rgba(15, 52, 96, 0.05);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h4 style="margin: 0; color: var(--primary-midnight); font-size: 0.95rem;">${service.title}</h4>
                    <span style="font-weight: 700; color: var(--primary-midnight); font-size: 0.85rem;">$${service.price.toLocaleString()}</span>
                </div>
                <p style="font-size: 0.75rem; color: #666; margin: 8px 0;">${service.description}</p>
                <button class="btn-primary" 
                        data-action="request" 
                        data-id="${service.id}"
                        style="width: 100%; padding: 10px; font-size: 0.7rem; background: none; color: var(--primary-midnight); border: 1px solid var(--primary-midnight);">
                    SOLICITAR INFORMACIÓN
                </button>
            </div>
        `).join('');
    };

    // Inicialización del flujo
    fetchServices();

    /**
     * GESTIÓN DE INTERACCIONES
     */
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const { action, id } = btn.dataset;

        if (action === 'request') {
            const service = SERVICES_CONFIG.find(s => s.id === id);
            alert(`🚀 Intervención Estratégica:\nHas solicitado información sobre: ${service.title}.\nUn consultor senior se pondrá en contacto contigo.`);
            // Aquí conectarás con tu CRM o sistema de correos
        }
    });
});

/**
 * MOTOR DE INTELIGENCIA ESTRATÉGICA (IA PRESTIGE)
 * Objetivo: Orquestar la comunicación entre el expediente del usuario y Gemini.
 */
window.startIAConsultant = async () => {
    const chatContainer = document.getElementById('ai-chat-container');
    const chatMessages = document.getElementById('ai-chat-messages');
    const user = auth.currentUser;
    
    chatContainer.style.display = 'flex';

    if (!user) return;

    try {
        // 1. MOTOR DE EXTRACCIÓN: Recuperamos Perfil y Workbooks
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'ai-loading-dna';
        loadingMsg.style.cssText = "font-size: 0.7rem; color: var(--accent-gold); font-style: italic; margin-bottom: 15px;";
        loadingMsg.innerText = "Sincronizando expediente estratégico...";
        chatMessages.appendChild(loadingMsg);

        // A. Obtenemos datos de perfil (Nombre, Empresa, Rol)
        const profileSnap = await getDoc(doc(db, "usuarios", user.uid));
        const profileData = profileSnap.exists() ? profileSnap.data() : {};

        // B. Obtenemos todas las respuestas de sus workbooks
        const workbooksSnap = await getDocs(collection(db, "usuarios", user.uid, "progreso_workbooks"));
        const workbookData = {};
        workbooksSnap.forEach(doc => {
            workbookData[doc.id] = doc.data();
        });

        // 2. MOTOR DE IDENTIDAD: Cargamos el ADN institucional (JSON)
        const dnaResponse = await fetch('../shared/cultura-dna.json');
        const dnaData = await dnaResponse.json();

        // 3. CONSOLIDACIÓN DE CONTEXTO: Fusionamos ADN Cultural + ADN Empresarial
        USER_STRATEGIC_CONTEXT = {
            usuario: {
                nombre: profileData.nombre || "Líder Dreams",
                empresa: profileData.empresa || "Empresa en Crecimiento",
                diagnosticos: workbookData
            },
            culturaInstitucional: dnaData // El Consultor IA ahora "bebe" de tu fuente de verdad
        };

        loadingMsg.innerText = `✅ ADN de ${USER_STRATEGIC_CONTEXT.empresa} sincronizado.`;
        setTimeout(() => loadingMsg.remove(), 2000);

    } catch (error) {
        console.error("🚨 Error al sincronizar contexto IA:", error);
    }
};

// --- ESCUCHADOR DE MENSAJES DEL CHAT ---
document.getElementById('ai-chat-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('ai-user-input');
    const chatMessages = document.getElementById('ai-chat-messages');
    const userMessage = input.value.trim();

    if (!userMessage) return;

    // A. Renderizado del Mensaje del Usuario (Estilo Fino)
    const userBubble = `
        <div style="align-self: flex-end; background: var(--primary-midnight); color: white; padding: 12px 18px; border-radius: 18px 0 18px 18px; font-size: 0.85rem; max-width: 80%; box-shadow: 0 4px 15px rgba(15, 52, 96, 0.1);">
            ${userMessage}
        </div>
    `;
    chatMessages.insertAdjacentHTML('beforeend', userBubble);
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // B. Handshake Seguro con Netlify Function
    try {
        // Indicador de "IA escribiendo..."
        const typingId = 'ai-typing-' + Date.now();
        chatMessages.insertAdjacentHTML('beforeend', `<div id="${typingId}" style="font-size: 0.7rem; color: var(--accent-gold); font-style: italic; margin-bottom: 15px;">El Consultor está analizando...</div>`);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const response = await fetch('/.netlify/functions/consultor-ia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: userMessage,
                userContext: USER_STRATEGIC_CONTEXT
            })
        });

        const data = await response.json();
        document.getElementById(typingId).remove(); // Quitamos el indicador

        // C. Renderizado de la respuesta Prestige
        const aiBubble = `
            <div style="align-self: flex-start; background: rgba(15, 52, 96, 0.05); padding: 15px 20px; border-radius: 0 18px 18px 18px; color: var(--primary-midnight); max-width: 85%; font-size: 0.85rem; border: 0.5px solid rgba(15, 52, 96, 0.1);">
                ${data.text}
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', aiBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error("🚨 Error de conexión IA:", error);
    }
});
// public/src/app.js

import { login, logout, redirectByUserRole, resetPassword } from './auth/auth.js';
import { db, auth, doc, setDoc, getDoc, checkAccess } from './shared/firebase-config.js';

/**
 * CONTROLADOR QUIRÚRGICO DE BOTONES INTELIGENTES
 * Gestiona la mutación de los botones del Dashboard según el acceso real.
 */
const syncDashboardAccess = async () => {
    const btnApps = document.getElementById('btn-apps-access');
    
    if (btnApps) {
        // Consultamos al motor de resiliencia
        const hasAccess = await checkAccess('apps', 'bloque-general');
        
        if (hasAccess) {
            // ESTADO: DESBLOQUEADO (Prestige Gold)
            btnApps.innerText = "MIS APLICACIONES";
            btnApps.style.opacity = "1";
            btnApps.onclick = () => window.location.href = 'apps.html';
        } else {
            // ESTADO: BLOQUEADO (Estrategia de Conversión)
            btnApps.innerText = "Para mayor información agenda tu cita";
            btnApps.style.background = "var(--primary-midnight)";
            btnApps.style.border = "1px solid var(--accent-gold)";
            btnApps.onclick = (e) => {
                e.preventDefault();
                // Usamos el sistema de mensajes que ya tienes para abrir el contacto
                window.postMessage({ type: 'OPEN_CONTACT_MODAL' }, '*');
            };
        }
    }
};
import { onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- PERSISTENCIA DE SESIÓN (CENTINELA GLOBAL) ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log(`✅ Sesión activa detectada: ${user.email}`);

        try {
            // TRAZABILIDAD: Validación de Seguridad (Password Obligatorio)
            const userRef = doc(db, "usuarios", user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            if (userData?.requiereCambioPassword) {
                console.warn("🔐 Protocolo Prestige: Cambio de contraseña obligatorio detectado.");
                // Bloqueamos redirecciones y disparamos el evento para el modal (Paso 5)
                window.dispatchEvent(new CustomEvent('SHOW_PASSWORD_CHANGE_MODAL', { 
                    detail: { uid: user.uid, email: user.email } 
                }));
                return; // Detenemos el flujo aquí hasta que cumpla el requisito
            }

            // PROTECCIÓN DE RUTAS: Si no requiere cambio, procede con el flujo normal de la SPA
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                redirectByUserRole(user.uid);
            }
            
            if (window.location.pathname.includes('dashboard.html')) {
                // HIDRATACIÓN DE IDENTIDAD: Localizamos el ancla y personalizamos el saludo
                const displayElement = document.getElementById('user-display-name');
                if (displayElement) {
                    // TRACEABILIDAD: Priorizamos el nombre de perfil de Firestore
                    const name = userData?.nombre || user.displayName || 'Socio';
                    displayElement.innerText = `Bienvenido de nuevo, ${name}`;
                    displayElement.style.opacity = "1";
                }
                syncDashboardAccess();
            }
        } catch (error) {
            console.error("🚨 Error en la verificación de trazabilidad de usuario:", error);
        }
    } else {
        // SEGURIDAD: Si no hay sesión y el usuario intenta entrar a una página privada, 
        // lo redirigimos al login para proteger la integridad del ecosistema.
        const privatePages = ['/academia.html', '/dashboard.html', '/admin.html'];
        if (privatePages.some(page => window.location.pathname.includes(page))) {
            console.warn("⚠️ Acceso no autorizado. Redirigiendo al Login...");
            window.location.href = '/index.html';
        }
    }
});

// Esperamos a que la página cargue totalmente para la lógica del DOM
document.addEventListener('DOMContentLoaded', () => {

    // --- MOTOR DE IDENTIDAD VISUAL (DINÁMICO) ---
    /**
     * Localiza elementos de marca (logos) y les inyecta la ruta de Firebase Storage
     * utilizando el motor central de rutas DREAMS_CONFIG.
     */
    /**
     * MOTOR DE IDENTIDAD UNIFICADO: Escanea todo el DOM en busca de activos 
     * marcados para sincronización con la nube (data-asset).
     */
    // TRACEABILIDAD: Exponemos el motor a window para que componentes dinámicos (Sidebar) 
    // puedan re-hidratar sus activos tras ser inyectados.
    window.initGlobalAssets = () => {
        const assets = document.querySelectorAll('[data-asset]');
        
        assets.forEach(el => {
            const assetName = el.dataset.asset;
            const firebaseUrl = window.DREAMS_CONFIG.resolvePath(assetName, 'Shared');
            
            // 1. SINCRONIZACIÓN DE ESTILOS (Marca de agua en CSS)
            if (assetName === 'logo.png') {
                document.documentElement.style.setProperty('--dynamic-logo-url', `url("${firebaseUrl}")`);
            }

            // 2. LÓGICA DE RENDERIZADO PARA IMÁGENES
            if (el.tagName === 'IMG') {
                // Configuramos el manejador de errores ANTES de asignar el src
                el.onerror = () => {
                    console.warn(`⚠️ CDN no disponible para [${assetName}]. Ejecutando recuperación local.`);
                    el.src = `assets/img/${assetName}`; // Corrección de backticks para template literal
                    el.classList.remove('opacity-0');
                    el.style.opacity = "1";
                };

                el.onload = () => {
                    el.classList.remove('opacity-0');
                    el.style.opacity = "1";
                };

                if (firebaseUrl) el.src = firebaseUrl;
            }
        });
    };

    // DISPARO SINCRONIZADO (Resilient Boot): 
    // Aseguramos que el Motor de Rutas esté presente antes de procesar activos.
    const bootApp = () => {
        if (window.DREAMS_CONFIG && window.DREAMS_CONFIG.resolvePath) {
            console.log("🚀 Motor de rutas detectado. Inicializando activos...");
            initGlobalAssets();
        } else {
            console.warn("⏳ Esperando motor de rutas (DREAMS_CONFIG)...");
            // Reintento quirúrgico cada 100ms para dar tiempo al fallback del HTML
            setTimeout(bootApp, 100);
        }
    };

    bootApp();

    // Localizamos el formulario de inicio de sesión por su ID
    const loginForm = document.getElementById('login-form');

    // 1. LÓGICA DE AUTENTICACIÓN (ACCESO, SALIDA Y RECUPERACIÓN)
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await login(email, password);
        });

        // DISPARADOR DE RECUPERACIÓN (RESET PASSWORD)
        const btnForgot = document.getElementById('forgot-password');
        btnForgot?.addEventListener('click', async (e) => {
            e.preventDefault();
            const emailField = document.getElementById('email');
            
            // Trazabilidad: Usamos el email ya escrito en el formulario
            await resetPassword(emailField.value);
        });
    }

    // Manejador global de cierre de sesión (Logout)
    // TRACEABILIDAD: Permite invalidar el token para que el Sentinel detenga la redirección automática.
    document.addEventListener('click', async (e) => {
        if (e.target.closest('#btn-logout')) {
            e.preventDefault();
            console.log("🚪 Cerrando sesión y liberando el Login...");
            try {
                await logout();
                // El observador onAuthStateChanged detectará el cambio y permitirá estar en index.html
            } catch (error) {
                console.error("🚨 Error en la desconexión:", error);
            }
        }
    });

    // 2. LÓGICA DE CONTACTO (FASE 3: HUMANIZACIÓN)
    const contactOverlay = document.getElementById('contact-overlay');
    const btnOpenContact = document.getElementById('btn-open-contact');
    const btnCloseContact = document.getElementById('btn-close-contact');
    const contactForm = document.getElementById('contact-form');
    const contactStatus = document.getElementById('contact-status');

    // Función de control de la cápsula (Resiliente)
    const toggleContact = (state) => {
        // TRACEABILIDAD: Verificamos existencia antes de mutar el DOM para evitar errores en SPA
        if (!contactOverlay) {
            console.warn("⚠️ Protocolo Interrumpido: El elemento #contact-overlay no existe en esta página. Inyecta el HTML del modal para activar la interfaz de contacto.");
            return;
        }

        if (state) {
            contactOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; 
        } else {
            contactOverlay.classList.remove('active');
            document.body.style.overflow = ''; 
        }
    };

    // 1. Declaración segura de elementos de contacto
    const btnContactFab = document.getElementById('btn-contact-fab'); 

    // 2. Escuchadores de eventos mediante delegación (Cubre botones individuales y clases .btn-contact-trigger)
    document.addEventListener('click', (e) => {
        // Detectamos si el clic fue en un botón de apertura (por ID o por Clase)
        const trigger = e.target.closest('.btn-contact-trigger') || 
                        e.target.closest('#btn-open-contact') || 
                        e.target.closest('#btn-contact-fab');
        
        if (trigger) {
            e.preventDefault();
            toggleContact(true);
        }

        // Detectamos si el clic fue en el botón de cierre
        if (e.target.closest('#btn-close-contact')) {
            toggleContact(false);
        }
    });
    // 3. Lógica de Envío de Formulario
    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSend = document.getElementById('btn-send-contact');
        const originalText = btnSend.innerText;
        
        btnSend.disabled = true;
        btnSend.innerText = "ENVIANDO...";

        // Capturamos los valores con protección: si el campo no existe, enviamos un texto vacío
        const formData = {
            destinatario: "contacto@miempresacrece.com.mx",
            nombre: document.getElementById('contact-name')?.value || "No proporcionado",
            email: document.getElementById('contact-email')?.value || "Sin email",
            interes: document.getElementById('contact-interest')?.value || "General",
            mensaje: document.getElementById('contact-message')?.value || "Sin mensaje",
            contexto: `Solicitud desde: ${window.location.pathname}`
        };

        try {
            const solicitudId = `solicitud_${Date.now()}`;
            const docRef = doc(db, "solicitudes_contacto", solicitudId);

            // 1. PERSISTENCIA: Registro en Firestore para control administrativo
            await setDoc(docRef, {
                ...formData,
                fechaEnvio: new Date().toISOString(),
                estado: "pendiente",
                usuarioId: auth.currentUser?.uid || "visitante"
            });

            // 2. DISCRIMINADOR DE INTENCIÓN (Superpoder de Respuesta Inmediata)
            // Filtramos si es compra (Consultoría) o asistencia (Dudas/Soporte/Otro)
            const intentType = formData.interes === 'Consultoría' ? 'CARRITO_COMPRA' : 'CONFIRMACION_SOPORTE';

            // 3. DISPARO AUTOMÁTICO: Conexión con el motor de notificaciones Prestige
            await fetch('/.netlify/functions/intervencion-notificacion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destinatario: formData.email, // El cliente recibe la respuesta directa
                    cliente: { nombre: formData.nombre, email: formData.email },
                    servicio: { titulo: formData.interes, id: 'atencion_automatica' },
                    tipo: intentType,
                    omitirRegistroFirestore: true // Evitamos duplicar registros, ya lo hicimos en el paso 1
                })
            });

            contactStatus.innerText = "✅ Mensaje enviado. Revisa tu correo, te hemos respondido de inmediato.";
            contactStatus.style.color = "#2e7d32";
            contactForm.reset();
            
            setTimeout(() => {
                toggleContact(false);
                contactStatus.innerText = "";
            }, 3000);

        } catch (error) {
            contactStatus.innerText = "⚠️ Error de conexión. Intenta de nuevo.";
            contactStatus.style.color = "#c62828";
        } finally {
            btnSend.disabled = false;
            btnSend.innerText = originalText;
        }
    });

    // 4. PUENTE DE COMUNICACIÓN (REFORZADO): Receptor Universal de Datos Dreams
    window.addEventListener('message', async (event) => {
        const { type, data, metadata } = event.data;

        // A. Abrir modal de contacto (Humanización)
        if (type === 'OPEN_CONTACT_MODAL') {
            toggleContact(true);
        }

        // B. Sincronización de respuestas con Firestore (Persistencia Real)
        if (type === 'dreamsSync') {
            const user = auth.currentUser;
            if (!user) {
                console.warn("⚠️ Intento de sincronización sin sesión activa.");
                return;
            }

            // Normalización de Metadatos: Aceptamos tanto sessionId como sessionID para evitar fallos de capitalización
            const workbookId = metadata.sessionId || metadata.sessionID || 'sesion_general';
            const docRef = doc(db, "usuarios", user.uid, "progreso_workbooks", workbookId);

            try {
                await setDoc(docRef, {
                    [data.id]: data.value,
                    lastUpdate: new Date().toISOString(),
                    courseID: metadata.courseID || 'consolida-360'
                }, { merge: true });
                
                // Verificación Visual en Consola:
                console.groupCollapsed(`☁️ Dreams Sync: ${workbookId}`);
                console.log("Campo:", data.id);
                console.log("Valor:", data.value);
                console.groupEnd();
            } catch (error) {
                console.error("🚨 Error de persistencia en Firestore:", error);
            }
        }

        // C. Recuperación de datos (Handshake): El workbook pide sus datos al cargar
        if (type === 'WORKBOOK_READY') {
            const user = auth.currentUser;
            if (!user) return;

            const workbookId = metadata.sessionID || 'sesion_general';
            const docRef = doc(db, "usuarios", user.uid, "progreso_workbooks", workbookId);

            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    // Enviamos los datos rescatados de la nube de vuelta al iframe que los pidió
                    event.source.postMessage({
                        type: 'hydrateWorkbook',
                        payload: docSnap.data()
                    }, event.origin);
                    console.log(`📦 Dreams Cloud: Datos de [${workbookId}] enviados al cuaderno.`);
                }
            } catch (error) {
                console.error("🚨 Error al recuperar datos de la nube:", error);
            }
        }
    });

    // --- MOTOR DE SEGURIDAD PRESTIGE: CAMBIO DE CONTRASEÑA OBLIGATORIO ---
    window.addEventListener('SHOW_PASSWORD_CHANGE_MODAL', (e) => {
        const { uid, email } = e.detail;
        renderPasswordChangeModal(uid, email);
    });

    const renderPasswordChangeModal = (uid, email) => {
        // Evitar duplicados
        if (document.getElementById('modal-password-change')) return;

        const modalHtml = `
            <div id="modal-password-change" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 52, 96, 0.98); backdrop-filter:blur(20px); z-index:10000; display:flex; align-items:center; justify-content:center; font-family:'Montserrat', sans-serif;">
                <div style="background:#fff; width:90%; max-width:400px; padding:40px; border-radius:16px; box-shadow:0 25px 50px rgba(0,0,0,0.5); border-top:8px solid var(--accent-gold); text-align:center;">
                    <div style="color:var(--accent-gold); font-size:2rem; margin-bottom:20px;">🔐</div>
                    <h2 style="color:var(--primary-midnight); margin:0 0 10px 0; font-weight:900; font-size:1.2rem;">SEGURIDAD DE CUENTA</h2>
                    <p style="font-size:0.85rem; color:#666; margin-bottom:30px; line-height:1.5;">Bienvenido a <strong>Dreams Platform</strong>. Por su protección, es necesario que defina una nueva contraseña personal para activar su acceso.</p>
                    
                    <form id="form-change-password">
                        <input type="password" id="new-pass" placeholder="Nueva Contraseña" required minlength="6" style="width:100%; padding:14px; margin-bottom:12px; border:1.5px solid #eee; border-radius:8px; box-sizing:border-box;">
                        <input type="password" id="confirm-pass" placeholder="Confirmar Contraseña" required minlength="6" style="width:100%; padding:14px; margin-bottom:25px; border:1.5px solid #eee; border-radius:8px; box-sizing:border-box;">
                        
                        <button type="submit" id="btn-save-pass" style="width:100%; background:var(--primary-midnight); color:white; border:none; padding:16px; border-radius:8px; font-weight:700; cursor:pointer; letter-spacing:1px;">ACTIVAR MI CUENTA</button>
                    </form>
                    <p id="pass-error" style="color:#d32f2f; font-size:0.75rem; margin-top:15px; font-weight:600;"></p>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('form-change-password').addEventListener('submit', async (formEv) => {
            formEv.preventDefault();
            const newPass = document.getElementById('new-pass').value;
            const confirmPass = document.getElementById('confirm-pass').value;
            const errorEl = document.getElementById('pass-error');
            const btn = document.getElementById('btn-save-pass');

            if (newPass !== confirmPass) {
                errorEl.innerText = "⚠️ Las contraseñas no coinciden.";
                return;
            }

            try {
                btn.disabled = true;
                btn.innerText = "SINCRONIZANDO...";

                // 1. Actualización en Firebase Auth
                await updatePassword(auth.currentUser, newPass);

                // 2. Trazabilidad en Firestore: Eliminamos el flag de cambio obligatorio
                const userRef = doc(db, "usuarios", uid);
                await setDoc(userRef, { requiereCambioPassword: false }, { merge: true });

                console.log("✅ Contraseña actualizada y flag removido.");
                
                // 3. Liberación y Redirección
                document.getElementById('modal-password-change').remove();
                redirectByUserRole(uid);

            } catch (error) {
                console.error("Error al cambiar pass:", error);
                errorEl.innerText = "🚨 Error de seguridad. Por favor re-ingrese su contraseña actual e intente de nuevo.";
                btn.disabled = false;
                btn.innerText = "ACTIVAR MI CUENTA";
            }
        });
    };
});
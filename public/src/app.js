// public/src/app.js

import { login, logout, redirectByUserRole, resetPassword } from './auth/auth.js';
import { db, auth, doc, setDoc, getDoc, checkAccess, collection, getDocs } from './shared/firebase-config.js';

/**
 * MOTOR DE AGREGACIÓN DREAMS (DASHBOARD v2.0)
 * Busca y suma resultados de KPIs configurados en el catálogo.
 */
/**
 * MOTOR DE AGREGACIÓN MULTIDIMENSIONAL (DASHBOARD v3.0)
 * Procesa arreglos de KPIs manuales y consolida resultados transversales.
 */
const aggregateAxisResults = async (uid, accessIds, catalogCollection) => {
    let totalValue = 0;
    let kpiCount = 0;

    // 1. SINCRONIZACIÓN DE CATÁLOGO: Obtenemos definiciones de KPIs
    const catalogSnap = await getDocs(collection(db, catalogCollection));
    const catalog = {};
    catalogSnap.forEach(d => catalog[d.id] = d.data());

    // 2. RECUPERACIÓN DE PROGRESO: Obtenemos toda la data del usuario de un solo golpe
    let userDataStore = {};
    if (catalogCollection === 'config_ecosistema') {
        const wSnap = await getDocs(collection(db, "usuarios", uid, "progreso_workbooks"));
        wSnap.forEach(doc => { userDataStore = { ...userDataStore, ...doc.data() }; });
    } else {
        const uSnap = await getDoc(doc(db, "usuarios", uid));
        userDataStore = uSnap.exists() ? { ...uSnap.data(), ...uSnap.data().expediente?.finanzas } : {};
    }

    // 3. PROCESAMIENTO QUIRÚRGICO: Iteramos por producto y por cada KPI definido
    for (const productId of accessIds) {
        const product = catalog[productId];
        if (!product) continue;

        // Soporte dual: Nuevo arreglo 'kpis' o antiguo objeto 'kpi_config' (Resiliencia)
        const activeKpis = product.kpis || (product.kpi_config ? [product.kpi_config] : []);

        activeKpis.forEach(kpi => {
            if (!kpi.field_source) return;
            
            // Buscamos el valor manual en la tienda de datos consolidada
            if (userDataStore[kpi.field_source] !== undefined) {
                const val = parseFloat(userDataStore[kpi.field_source]) || 0;
                totalValue += val;
                kpiCount++;
            }
        });
    }

    return kpiCount > 0 ? { 
        total: totalValue, 
        avg: totalValue / kpiCount, 
        count: kpiCount 
    } : null;
};

/**
 * MOTOR DE EXTRACCIÓN GRANULAR (DASHBOARD v3.5)
 * Recupera el listado detallado de KPIs con sus valores actuales.
 */
const getGranularKPIData = async (uid, accessIds, catalogCollection) => {
    const details = [];
    
    // 1. SINCRONIZACIÓN DE DATOS (REUTILIZAMOS LÓGICA DE AGREGACIÓN)
    const catalogSnap = await getDocs(collection(db, catalogCollection));
    const catalog = {};
    catalogSnap.forEach(d => catalog[d.id] = d.data());

    let userDataStore = {};
    if (catalogCollection === 'config_ecosistema') {
        const wSnap = await getDocs(collection(db, "usuarios", uid, "progreso_workbooks"));
        wSnap.forEach(doc => { userDataStore = { ...userDataStore, ...doc.data() }; });
    } else {
        const uSnap = await getDoc(doc(db, "usuarios", uid));
        userDataStore = uSnap.exists() ? { ...uSnap.data(), ...uSnap.data().expediente?.finanzas } : {};
    }

    // 2. CONSTRUCCIÓN DE REPORTE GRANULAR
    for (const productId of accessIds) {
        const product = catalog[productId];
        if (!product) continue;

        const activeKpis = product.kpis || (product.kpi_config ? [product.kpi_config] : []);

        activeKpis.forEach(kpi => {
            if (!kpi.field_source) return;
            const val = userDataStore[kpi.field_source] !== undefined ? parseFloat(userDataStore[kpi.field_source]) : 0;
            details.push({
                label: kpi.label || 'Indicador',
                value: val,
                unit: kpi.unit || '',
                productTitle: product.title
            });
        });
    }
    return details;
};

/**
 * RENDERIZADOR DE DESGLOSE (UI PRESTIGE)
 * Pinta el modal de KPIs con micro-interacciones.
 */
const renderKPIDetails = (title, icon, details, targetUrl) => {
    const overlay = document.getElementById('breakdown-overlay');
    const list = document.getElementById('breakdown-list');
    const titleEl = document.getElementById('breakdown-title');
    const iconEl = document.getElementById('breakdown-icon');
    const actionBtn = document.getElementById('btn-breakdown-action');

    if (!overlay || !list) return;

    // A. Actualización de Cabecera
    titleEl.innerText = title;
    iconEl.innerText = icon;
    
    // B. Renderizado de Filas
    list.innerHTML = details.map(k => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #fafafa; border-radius: 12px; border-left: 4px solid var(--accent-gold);">
            <div>
                <span style="display: block; font-size: 0.6rem; color: #999; font-weight: 800; text-transform: uppercase;">${k.productTitle}</span>
                <span style="font-size: 0.85rem; font-weight: 600; color: var(--primary-midnight);">${k.label}</span>
            </div>
            <div style="text-align: right;">
                <span style="font-size: 1.1rem; font-weight: 800; color: var(--primary-midnight);">${k.value}${k.unit}</span>
            </div>
        </div>
    `).join('') || '<p style="text-align: center; color: #999; padding: 20px;">No hay métricas registradas para este eje.</p>';

    // C. Configuración de Navegación Final
    actionBtn.onclick = () => window.location.href = targetUrl;
    
    // D. Activación Visual
    overlay.classList.add('active');
};

/**
 * CONTROLADOR QUIRÚRGICO DE BOTONES INTELIGENTES
 * Gestiona la mutación de los botones del Dashboard según el acceso real.
 */
/**
 * MOTOR DE HIDRATACIÓN PRESTIGE (FASE 3)
 * Centraliza la carga de métricas y la seguridad del Carrusel.
 */
const hydrateDashboardMetrics = async (user, userData) => {
    const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);

    // 1. HIDRATACIÓN DEL BENTO GRID (KPIs)
    // Finanzas: Punto de Equilibrio
    const elBalance = document.getElementById('kpi-balance-point');
    if (elBalance) {
        // Buscamos datos en el expediente o progreso de Sesión B (Finanzas)
        const gastos = userData?.finanzas?.gastosFijos || 0;
        const margen = userData?.finanzas?.margenPorcentaje || 0.35; // 35% default
        const puntoEquilibrio = margen > 0 ? (gastos / margen) : 0;
        elBalance.innerText = formatCurrency(puntoEquilibrio);
    }

    /**
     * MOTOR DE RESULTADOS ESTRATÉGICOS v2.0 (Dual Logic)
     * Procesa KPIs de Rendimiento (Negocio) y KPIs de Uso (Engagement)
     */
    const processStrategicKPIs = async () => {
        const uid = user.uid;
        const accesos = userData?.accesos || {};

        // 1. EJE ACADEMIA (Resultados de Cursos)
        let totalPerformanceAcademia = 0;
        let countCursosConKPI = 0;
        const cursosContratados = accesos.cursos || [];

        for (const courseId of cursosContratados) {
            const courseSnap = await getDoc(doc(db, "config_ecosistema", courseId));
            const config = courseSnap.data()?.kpi_config;

            if (config && config.field_source) {
                // Buscamos el valor en todos los workbooks del usuario (Búsqueda Transversal)
                const workbooksRef = collection(db, "usuarios", uid, "progreso_workbooks");
                const wSnap = await getDocs(workbooksRef);
                
                wSnap.forEach(wDoc => {
                    const val = parseFloat(wDoc.data()[config.field_source]);
                    if (!isNaN(val)) {
                        totalPerformanceAcademia += val;
                        countCursosConKPI++;
                    }
                });
            }
        }

        // Renderizado en Burbuja Academia
        const elValAcademia = document.getElementById('kpi-val-academia');
        if (elValAcademia) {
            const result = countCursosConKPI > 0 ? (totalPerformanceAcademia / countCursosConKPI).toFixed(1) : "0";
            elValAcademia.innerText = `${result}${countCursosConKPI > 0 ? (cursosContratados[0]?.unit || '%') : '%'}`;
        }

        // 2. EJE CONSULTORÍA (Resultados de Intervención)
        const elValConsultoria = document.getElementById('kpi-val-consultoria');
        if (elValConsultoria) {
            const consultoriaKPI = userData?.expediente?.finanzas?.margenUtilidad || 0;
            elValConsultoria.innerText = `${consultoriaKPI}% ROE`;
        }

        // 3. EJE OPERATIVA / APPS (Engagement y Uso)
        const elValApps = document.getElementById('kpi-val-apps');
        if (elValApps) {
            const appsActivas = accesos.apps?.length || 0;
            const recomendaciones = userData?.metricas?.recomendaciones || 0;
            elValApps.innerText = `${appsActivas} Activos | ${recomendaciones} ✨`;
        }
    };

    await processStrategicKPIs();

    // 2. MOTOR DE DISTRIBUCIÓN OPERATIVA (ESTABILIZADO)
    const allCards = document.querySelectorAll('.split-operative-panel .glass-card');
    const monitorList = document.querySelector('.monitor-list');
    const aiFeed = document.querySelector('.ai-recommendation-feed');

    allCards.forEach(async (card) => {
        const productId = card.dataset.product;
        const type = productId.startsWith('app-') ? 'apps' : 'cursos';
        const statusLabel = card.querySelector('.status-label');
        
        const hasAccess = await checkAccess(type, productId);
        
        if (hasAccess) {
            // PROTOCOLO ACTIVO
            if (monitorList) monitorList.appendChild(card);
            if (statusLabel) {
                statusLabel.innerText = "ACTIVO";
                statusLabel.style.color = "var(--secondary-color)";
            }
            card.classList.remove('ai-suggestion-card');
            card.onclick = () => window.location.href = `${type}.html?id=${productId}`;
        } else {
            // PROTOCOLO SUGERENCIA IA
            if (aiFeed) aiFeed.appendChild(card);
            if (statusLabel) {
                statusLabel.innerText = "RECOMENDADO";
                statusLabel.style.color = "var(--accent-gold)";
            }
            card.classList.add('ai-suggestion-card');
            card.onclick = () => window.postMessage({ 
                type: 'OPEN_CONTACT_MODAL', 
                data: { subject: 'Adquisición de Activo', context: `ia_suggestion_${productId}` } 
            }, '*');
        }
        
        // Revelación elegante tras sincronización total
        card.style.display = 'flex';
        card.style.opacity = '1';
    });

    // 3. ACTUALIZACIÓN DE PÍLDORA DE AUTORIDAD (AURA)
    const pill = document.getElementById('authority-pill');
    if (pill) {
        const nivel = userData?.nivelAutoridad || 1;
        pill.innerText = `AUTORIDAD: NIVEL ${nivel}`;
        pill.style.background = nivel > 2 ? 'var(--secondary-color)' : 'var(--accent-gold)';
    }

    // 4. SINCRONIZACIÓN DINÁMICA DE BURBUJAS (KPIs + SENTINEL)
    const axes = {
        academia: { 
            node: document.querySelector('[data-axis="academia"]'), 
            kpiEl: document.getElementById('kpi-val-academia'),
            catalog: 'config_ecosistema',
            type: 'cursos'
        },
        apps: { 
            node: document.querySelector('[data-axis="apps"]'), 
            kpiEl: document.getElementById('kpi-val-apps'),
            catalog: null, // Las apps operativas se manejan por estatus individual
            type: 'apps'
        },
        consultoria: { 
            node: document.querySelector('[data-axis="consultoria"]'), 
            kpiEl: document.getElementById('kpi-val-consultoria'),
            catalog: 'config_consultoria',
            type: 'consultor'
        }
    };

    for (const [key, config] of Object.entries(axes)) {
        if (!config.node) continue;

        // A. HIDRATACIÓN DE KPIs REALES
        if (config.catalog && userData?.accesos?.[config.type]) {
            aggregateAxisResults(user.uid, userData.accesos[config.type], config.catalog)
                .then(result => {
                    if (result && config.kpiEl) {
                        // Buscamos la unidad del primer producto para consistencia visual
                        const unit = "%"; // Fallback o podrías traerlo del catálogo
                        config.kpiEl.innerText = `${Math.round(result.avg)}${unit}`;
                    }
                });
        }

        // B. PROTOCOLO DE NAVEGACIÓN MULTIDIMENSIONAL (KPI BREAKDOWN + SENTINEL)
        config.node.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // 1. Definición de Parámetros de Eje
            const labels = { academia: 'Resultados Academia', apps: 'Estatus Operativo', consultoria: 'Avance Consultoría' };
            const icons = { academia: '🎓', apps: '🛠️', consultoria: '🤝' };
            const targetUrl = key === 'academia' ? 'academia.html' : `${key}.html`;
            
            // 2. Validación de Acceso (Sentinel)
            const accessKey = key === 'apps' ? 'app-crm' : (userData.accesos?.consultor?.[0] || 'consultoria-base');
            const hasAccess = await checkAccess(config.type, accessKey);

            if (!hasAccess && key !== 'academia') {
                window.postMessage({ 
                    type: 'OPEN_CONTACT_MODAL', 
                    data: { subject: `Acceso a ${key.toUpperCase()}`, context: `axis_hub_${key}` } 
                }, '*');
                return;
            }

            // 3. Disparo de Desglose Granular
            if (config.catalog && userData?.accesos?.[config.type]) {
                const details = await getGranularKPIData(user.uid, userData.accesos[config.type], config.catalog);
                renderKPIDetails(labels[key], icons[key], details, targetUrl);
            } else {
                // Si el eje no tiene catálogo (Apps), navegamos directo
                window.location.href = targetUrl;
            }
        };
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

            /**
 * AURAMANAGER (GLOBAL): Sincronización de Identidad y Sentinel IA
 * Expuesta al objeto window para permitir que el Sidebar o la navegación SPA 
 * actualicen el branding dinámicamente.
 */
        window.AuraManager = async (userData = null) => {
            const path = window.location.pathname;
            const navCenter = document.getElementById('nav-center');
            const aiBtn = document.getElementById('btn-ai-consultant');

            const titles = {
                'dashboard.html': 'CENTRO DE MANDO',
                'academia.html': 'ACADEMIA DE ESTRATEGIA',
                'apps.html': 'ECOSISTEMA DE SOLUCIONES',
                'consultoria.html': 'CONSULTORÍA ESTRATÉGICA',
                'admin.html': 'PANEL DE CONTROL'
            };

            if (navCenter) {
                const moduleKey = Object.keys(titles).find(key => path.includes(key));
                // Fallback dinámico alineado a la marca comercial Mi Empresa Crece
                navCenter.innerText = titles[moduleKey] || 'MI EMPRESA CRECE';
            }

            // TRACEABILIDAD: La gestión de disparadores de IA se ha movido al Delegador Global 
            // (DOMContentLoaded) para garantizar paridad funcional y escalabilidad en todo el ecosistema.
        };

// --- DENTRO DEL OBSERVADOR onAuthStateChanged (Línea 105+) ---

            // PROTECCIÓN DE RUTAS Y CONFIGURACIÓN DE AURA
            const isAtLogin = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
            
            if (isAtLogin) {
                // Solo redirigimos si NO tiene pendiente el cambio de password
                if (!userData?.requiereCambioPassword) {
                    redirectByUserRole(user.uid);
                }
            } else {
                // AuraManager se ejecuta en todas las páginas internas para mantener la consistencia
                await AuraManager(userData);
            }
            
            if (window.location.pathname.includes('dashboard.html')) {
                // 1. HIDRATACIÓN DE IDENTIDAD
                const displayElement = document.getElementById('user-display-name');
                if (displayElement) {
                    const name = userData?.nombre || user.displayName || 'Socio';
                    displayElement.innerText = `Bienvenido de nuevo, ${name}`;
                    displayElement.style.opacity = "1";
                }

                // 2. DISPARO DEL MOTOR DE MÉTRICAS
                await hydrateDashboardMetrics(user, userData);
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

    // --- LÓGICA DE PANEL OPERATIVO (COLAPSO Y PERSISTENCIA) ---
    const shelf = document.getElementById('operative-shelf');
    const toggleBtn = document.getElementById('btn-toggle-shelf');
    const toggleIcon = document.getElementById('toggle-icon');

    if (toggleBtn && shelf) {
        // 1. Recuperar estado previo del usuario (Persistencia Prestige)
        const isStoredCollapsed = localStorage.getItem('dreams_dashboard_shelf_collapsed') === 'true';
        
        if (isStoredCollapsed) {
            shelf.classList.add('is-collapsed');
            if (toggleIcon) toggleIcon.innerText = '▶'; // Cambiamos el glifo para indicar expansión
        }

        // 2. Listener de interacción quirúrgica
        toggleBtn.onclick = (e) => {
            e.preventDefault();
            const isNowCollapsed = shelf.classList.toggle('is-collapsed');
            
            // Actualización de estado visual y persistencia
            if (toggleIcon) {
                toggleIcon.innerText = isNowCollapsed ? '▶' : '▼';
            }
            localStorage.setItem('dreams_dashboard_shelf_collapsed', isNowCollapsed);
            
            console.log(`🖥️ Dreams UI: Panel operativo ${isNowCollapsed ? 'colapsado' : 'expandido'}.`);
        };
    }

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

            // 2. LÓGICA DE RENDERIZADO PRESTIGE (Fade-in & Fallback)
            if (el.tagName === 'IMG') {
                // Preparamos el elemento para una entrada elegante (Integridad Visual)
                el.style.transition = 'opacity 0.8s ease-in-out';
                el.style.opacity = "0";

                el.onerror = () => {
                    console.warn(`⚠️ CDN no disponible para [${assetName}]. Recuperando fallback local.`);
                    el.src = `assets/img/${assetName}`;
                    el.style.opacity = "1"; // Forzamos visibilidad del recurso local
                };

                el.onload = () => {
                    el.style.opacity = "1"; // Entrada suave una vez cargada la imagen
                };

                // Disparo de carga: si no hay URL en la nube, saltamos directo al error/fallback
                if (firebaseUrl) {
                    el.src = firebaseUrl;
                } else {
                    el.onerror();
                }
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
    /**
     * AURA GLOBAL LISTENER: Centralización de Comandos de Cabecera
     * Gestiona la tríada estratégica: IA, Búsqueda y Soporte en todo el ecosistema.
     */
    document.addEventListener('click', (e) => {
        // TRACEABILIDAD: Incluimos el botón de cierre en la captura para evitar el bloqueo preventivo
        const auraBtn = e.target.closest('.nav-btn-prestige') || 
                        e.target.closest('.btn-contact-trigger') || 
                        e.target.closest('#btn-open-contact') || 
                        e.target.closest('#btn-contact-fab') ||
                        e.target.closest('#btn-close-contact');
        
        if (!auraBtn) return;
        e.preventDefault();

        const btnId = auraBtn.id;

        // 1. DISPARADOR IA (✨) - EJECUCIÓN GLOBAL NO-INTERRUPTIVA
        if (btnId === 'btn-nav-ia' || btnId === 'btn-ia-consultant') {
            if (typeof window.startIAConsultant === 'function') {
                window.startIAConsultant();
            } else {
                // TRACEABILIDAD: Fallback preventivo por si el Sidebar aún no termina de hidratar
                console.warn("⏳ Dreams Trace: El motor IA se está sincronizando con tu expediente. Reintente en un segundo.");
            }
        }

        // 2. DISPARADOR BÚSQUEDA (🔍) - ACTIVACIÓN QUIRÚRGICA
        else if (btnId === 'btn-nav-search') {
            if (!document.getElementById('search-overlay')) {
                SearchManager.init();
            }
            SearchManager.open();
        }

        // 3. DISPARADOR SOPORTE / CONTACTO (✉️) - CON HIDRATACIÓN DE CONTEXTO
        else if (btnId === 'btn-nav-support' || auraBtn.classList.contains('btn-contact-trigger') || btnId === 'btn-open-contact' || btnId === 'btn-contact-fab') {
            // TRACEABILIDAD: Si es el botón de la zona Aura (Navbar), enviamos contexto técnico
            if (btnId === 'btn-nav-support') {
                window.postMessage({ 
                    type: 'OPEN_CONTACT_MODAL', 
                    data: { subject: 'Soporte Técnico', context: 'aura_nav_support' } 
                }, '*');
            } else {
                toggleContact(true);
            }
        }

        // 4. CIERRE DE MÓDULOS
        if (e.target.closest('#btn-close-contact')) {
            toggleContact(false);
        }
    });

    // 4. PUENTE DE COMUNICACIÓN (REFORZADO): Receptor Universal de Datos Dreams
    window.addEventListener('message', async (event) => {
        const { type, data, metadata } = event.data;

        // A. ABRIR MODAL DE CONTACTO (MOTOR DE HIDRATACIÓN PRESTIGE)
        if (type === 'OPEN_CONTACT_MODAL') {
            const interestSelect = document.getElementById('contact-interest');
            const messageArea = document.getElementById('contact-message');

            // ESCENARIO 1: INTERÉS EN APPS (Sidebar o Dashboard)
            if (data?.subject === 'Adquisición de Apps' || data?.subject === 'Adquisición de Activo') {
                if (interestSelect) interestSelect.value = 'Otro'; 
                if (messageArea) {
                    messageArea.value = `[SOLICITUD DE ACTIVACIÓN] Estimado Staff de Mi Empresa Crece: Deseo integrar el Ecosistema de Apps a mi operativa estratégica. Quedo a la espera del enlace de Zoom para coordinar la implementación técnica en mi PyME.`;
                }
            }
            
            // ESCENARIO 2: SOPORTE TÉCNICO (Header Aura)
            else if (data?.subject === 'Soporte Técnico') {
                if (interestSelect) interestSelect.value = 'Soporte';
                if (messageArea) {
                    messageArea.value = `[REPORTE TÉCNICO] Hola, requiero asistencia sobre el funcionamiento de la plataforma en el módulo actual. Agradezco su validación para mantener la continuidad de mi gestión.`;
                }
            }

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
                    <p style="font-size:0.85rem; color:#666; margin-bottom:30px; line-height:1.5;">Bienvenido a <strong>Mi Empresa Crece Platform</strong>. Por su protección, es necesario que defina una nueva contraseña personal para activar su acceso.</p>
                    
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

/**
 * SEARCHMANAGER: Motor de Búsqueda de Mi Empresa Crece Platform
 * Centraliza el inventario del Blueprint y gestiona la UI de navegación rápida.
 */
const SearchManager = {
    inventory: [
        { id: 'DC-CAP-01', name: 'Consolida 360 Live', line: 'Capacitación', url: 'academia.html' },
        { id: 'DC-CAP-02', name: 'Consolida 360 Online', line: 'Capacitación', url: 'academia.html' },
        { id: 'DC-TEC-02', name: 'CRM Ventas', line: 'Tecnología', url: 'apps.html' },
        { id: 'DC-TEC-03', name: 'ERP Finanzas', line: 'Tecnología', url: 'apps.html' },
        { id: 'DC-TEC-01', name: 'Consolida 360 (App)', line: 'Tecnología', url: 'apps.html' },
        { id: 'DNA-01', name: 'Nuestro ADN (Identidad)', line: 'Identidad', url: 'identidad.html' },
        { id: 'CONS-01', name: 'Consultoría IA', line: 'Consultoría', url: 'consultoria.html' }
    ],

    init() {
        if (document.getElementById('search-overlay')) return;
        
        const html = `
            <div id="search-overlay" class="purpose-overlay" style="z-index: 15000;">
                <div class="purpose-bubble" style="max-width: 600px; padding: 40px;">
                    <button class="close-bubble" id="btn-close-search">&times;</button>
                    <header style="margin-bottom: 25px; text-align: center;">
                        <h2 style="color: var(--primary-midnight); font-weight: 700; margin-bottom: 5px; font-size: 1.4rem;">BUSCADOR</h2>
                        <p style="font-size: 0.8rem; color: #666;">Localiza activos, cursos o herramientas de gestión.</p>
                    </header>
                    <input type="text" id="search-input" placeholder="¿Qué estás buscando hoy?" 
                           style="width: 100%; padding: 18px; border-radius: 15px; border: 2px solid var(--accent-gold); font-family: 'Montserrat'; font-size: 1.1rem; outline: none; margin-bottom: 20px;">
                    <div id="search-results" style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 5px;">
                        </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        
        const input = document.getElementById('search-input');
        input.addEventListener('input', (e) => this.filter(e.target.value));
        
        document.getElementById('btn-close-search').onclick = () => this.close();
        document.getElementById('search-overlay').onclick = (e) => {
            if (e.target.id === 'search-overlay') this.close();
        };

        // Atajo de teclado: ESC para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    },

    open() {
        const overlay = document.getElementById('search-overlay');
        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.classList.add('active');
            document.getElementById('search-input').focus();
        }, 10);
        this.filter(''); // Mostrar todo inicialmente
    },

    close() {
        const overlay = document.getElementById('search-overlay');
        overlay.classList.remove('active');
        setTimeout(() => overlay.style.display = 'none', 400);
    },

    filter(query) {
        const container = document.getElementById('search-results');
        const filtered = this.inventory.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) || 
            item.line.toLowerCase().includes(query.toLowerCase())
        );

        container.innerHTML = filtered.map(item => `
            <div class="search-result-item" onclick="window.location.href='${item.url}'" 
                 style="padding: 15px; background: rgba(15, 52, 96, 0.03); border-radius: 12px; cursor: pointer; transition: all 0.3s ease; display: flex; justify-content: space-between; align-items: center; border: 1px solid transparent;">
                <div>
                    <span style="display: block; font-size: 0.9rem; font-weight: 700; color: var(--primary-midnight);">${item.name}</span>
                    <span style="font-size: 0.7rem; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">${item.line}</span>
                </div>
                <span style="font-size: 1.2rem; color: var(--accent-gold);">→</span>
            </div>
        `).join('') || '<p style="text-align: center; color: #999; padding: 20px; font-size: 0.9rem;">No se encontraron activos para esta búsqueda.</p>';
        
        // Micro-interacción: Hover dinámico
        container.querySelectorAll('.search-result-item').forEach(el => {
            el.onmouseenter = () => {
                el.style.background = "rgba(15, 52, 96, 0.08)";
                el.style.borderColor = "var(--accent-gold)";
                el.style.transform = "translateX(5px)";
            };
            el.onmouseleave = () => {
                el.style.background = "rgba(15, 52, 96, 0.03)";
                el.style.borderColor = "transparent";
                el.style.transform = "translateX(0)";
            };
        });
    }
};
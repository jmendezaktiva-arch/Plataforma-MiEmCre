// public/src/shared/workbook-core.js
/**
 * DREAMS WORKBOOK CORE v1.2 | Mi Empresa Crece
 * Fusión: Resiliencia v1.1 + Debounce v1.2 (Plan de Trabajo 2.0)
 */

const WorkbookCore = {
    config: {
        debounceTime: 2000, 
        timers: {} 
    },

    // TRACEABILIDAD: Recuperamos los metadatos de la URL para dar contexto al motor de rutas
    metadata: {
        courseID: new URLSearchParams(window.location.search).get('courseId') || 'consolida-360',
        sessionID: new URLSearchParams(window.location.search).get('sessionId') || 'sesion-a',
        lastUpdate: new Date().toISOString()
    },

    // --- MOTOR DE ACTIVOS PARA WORKBOOKS (UNIFICADO) ---
    initWorkbookAssets() {
        // TRACEABILIDAD: Escaneamos todos los logos (por data-asset o ID) para sincronizar 
        // la identidad visual en Sidebars, Headers y Reportes de forma masiva.
        const logos = document.querySelectorAll('[data-asset="logo.png"], #workbook-logo');
        
        logos.forEach(logo => {
            const logoUrl = this.utils.resolvePath('logo.png');
            if (logoUrl) {
                logo.src = logoUrl;
            }
            
            logo.onerror = () => {
                console.warn(`⚠️ Dreams Core: Error al cargar logo en ${this.metadata.sessionID}. Aplicando fallback.`);
                logo.src = "../../../../../assets/images/brand/logo.png";
            };
        });
    },

    // --- MOTOR DE PERSISTENCIA MULTI-HILO (REGLA DE ORO) ---
    saveProgress(fieldId, value) {
        // Trazabilidad: Cancelamos solo el cronómetro de ESTE campo específico
        clearTimeout(this.config.timers[fieldId]);
        
        // Capa 1: Persistencia local inmediata
        localStorage.setItem(`cuaderno_${fieldId}`, value);

        // Capa 2: Programación de sincronización a la nube (Cero colisiones)
        this.config.timers[fieldId] = setTimeout(() => {
            console.log(`☁️ Dreams Sync [Pendiente]: ${fieldId}`);
            this.syncQueue.push({
                id: fieldId, 
                value: this.utils.sanitize(value)
            });
            delete this.config.timers[fieldId]; // Limpieza de memoria
        }, this.config.debounceTime);
    },

    // --- MOTOR DE RESILIENCIA (CONSERVADO) ---
    syncQueue: {
        tasks: JSON.parse(localStorage.getItem('cuaderno_sync_queue') || '[]'),
        isProcessing: false,

        push(payload) {
            this.tasks.push({ ...payload, timestamp: Date.now() });
            this.persist();
            this.process();
        },

        persist() {
            localStorage.setItem('cuaderno_sync_queue', JSON.stringify(this.tasks));
        },

        async process() {
            if (this.isProcessing || this.tasks.length === 0 || !navigator.onLine) return;
            
            this.isProcessing = true;
            while (this.tasks.length > 0 && navigator.onLine) {
                const currentTask = this.tasks[0];
                try {
                    window.parent.postMessage({ 
                        type: 'dreamsSync', 
                        data: currentTask,
                        metadata: WorkbookCore.metadata 
                    }, '*');
                    
                    this.tasks.shift(); 
                    this.persist();
                } catch (e) {
                    console.error("🚨 Error en bus de datos:", e);
                    break; 
                }
                await new Promise(r => setTimeout(r, 100));
            }
            this.isProcessing = false;
        }
    },

    // --- UTILIDADES Y PDF (CONSERVADOS) ---
    utils: {
        sanitize(val) {
            if (typeof val !== 'string') return val;
            return val.replace(/<\/?[^>]+(>|$)/g, "").trim();
        },
        resolvePath(asset) {
            // TRACEABILIDAD: Acceso al motor global mediante window para evitar ReferenceError
            if (window.DREAMS_CONFIG && typeof window.DREAMS_CONFIG.resolvePath === 'function') {
                return window.DREAMS_CONFIG.resolvePath(asset, WorkbookCore.metadata.sessionID);
            }
            console.warn("⚠️ Dreams Core: Motor de rutas no detectado. Retornando asset original.");
            return asset;
        }
    },

    async exportToPDF(elementId, filename) {
        // ... (Código original de html2canvas y jsPDF conservado íntegramente)
    }
};

// --- LISTENERS DE INTEGRACIÓN (CONSERVADOS Y MEJORADOS) ---

// --- ESCUCHADOR MAESTRO DE ENTRADAS (REPARADO PARA DATA-ID) ---
document.addEventListener('input', (e) => {
    // Trazabilidad: Priorizamos 'data-id' de los nuevos ejercicios modularizados
    const fieldId = e.target.dataset.id || e.target.id || e.target.name;
    
    if (e.target.dataset.persist !== "false" && fieldId) {
        // El Core ahora "ve" las entradas del Ejercicio 7 y las guarda con Debounce
        WorkbookCore.saveProgress(fieldId, e.target.value);
    }
});

window.addEventListener('message', (e) => {
    // 1. HIDRATACIÓN DE PROGRESO (Datos de ejercicios guardados)
    if (e.data.type === 'hydrateWorkbook' && e.data.payload) {
        console.log("📦 Dreams Core: Hidratando UI con datos de la nube...");
        Object.entries(e.data.payload).forEach(([key, val]) => {
            localStorage.setItem('cuaderno_' + key, val);
            const el = document.querySelector(`[data-id="${key}"]`) || document.getElementById(key) || document.getElementsByName(key)[0];
            if (el) {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    el.checked = (val === true || val === 'true');
                } else { el.value = val; }
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        window.dispatchEvent(new CustomEvent('coreHydrated'));
    }

    // 2. HIDRATACIÓN DE IDENTIDAD (Inyección automática de Perfil)
    if (e.data.type === 'injectProfile' && e.data.profile) {
        console.log("👤 Dreams Core: Sincronizando identidad del líder...");
        const profileMap = {
            'nombre_participante': e.data.profile.nombre,
            'nombre_empresa': e.data.profile.empresa
        };

        Object.entries(profileMap).forEach(([id, value]) => {
            if (!value) return;
            const el = document.querySelector(`[data-id="${id}"]`);
            if (el) {
                el.value = value;
                el.readOnly = true; // Protegemos el dato oficial
                el.style.backgroundColor = "#F9FAFB"; // Fondo sutil de "solo lectura"
                el.style.cursor = "not-allowed";
                el.dispatchEvent(new Event('input', { bubbles: true })); // Guardamos en el progreso local
            }
        });
    }
});

window.addEventListener('online', () => WorkbookCore.syncQueue.process());

// Handshake Inicial
// Inicialización Sincronizada (DNA 3.0 Prestige)
document.addEventListener('DOMContentLoaded', () => {
    WorkbookCore.initWorkbookAssets();

    // DREAMS PRESTIGE: Sensor de proximidad para Sidebar del Workbook
    const workbookSidebar = document.getElementById('workbook-sidebar');
    
    if (workbookSidebar) {
        // Al entrar el mouse (Proximidad detectada)
        workbookSidebar.addEventListener('mouseenter', () => {
            workbookSidebar.classList.remove('sidebar-collapsed');
        });

        // Al salir el mouse (Regreso al enfoque de trabajo)
        workbookSidebar.addEventListener('mouseleave', () => {
            workbookSidebar.classList.add('sidebar-collapsed');
        });
    }
});

// Handshake Inicial
window.parent.postMessage({ type: 'WORKBOOK_READY', metadata: WorkbookCore.metadata }, '*');
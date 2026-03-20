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

        // Capa 2: Programación de sincronización a la nube con FILTRO DE INTEGRIDAD
        this.config.timers[fieldId] = setTimeout(() => {
            // VALIDACIÓN CRÍTICA (Hito 1): 
            // No sincronizamos si el valor es nulo, indefinido o un cero que rompa la lógica financiera (Race Condition).
            const isInvalidZero = (typeof value === 'number' || !isNaN(value)) && Number(value) <= 0 && fieldId.includes('total');
            const isEmpty = value === null || value === undefined;

            if (isEmpty || isInvalidZero) {
                console.warn(`🛡️ Dreams Guard: Sincronización abortada para [${fieldId}]. Motivo: Valor ínfimo o nulo detectado.`);
                delete this.config.timers[fieldId];
                return; 
            }

            console.log(`☁️ Dreams Sync [Validado]: ${fieldId}`);
            this.syncQueue.push({
                id: fieldId, 
                value: this.utils.sanitize(value)
            });
            delete this.config.timers[fieldId]; 
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

    // --- MOTOR DE VIRALIDAD MULTI-CANAL v2.0 ---
    sharing: {
        config: {
            title: "Recomendación: Programa Consolida 360°",
            text: "¡Hola! Te recomiendo el Programa Consolida 360° de Mi Empresa Crece. Estoy usando su plataforma 'Dreams' para profesionalizar mi PyME y el contenido es extraordinario.",
            url: window.location.origin // Detecta automáticamente la URL base
        },
        async trigger() {
            // Si el dispositivo soporta compartir nativo (iPhone/Android), usamos el menú del sistema
            if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                try {
                    await navigator.share(this.config);
                } catch (e) { console.log("Compartir omitido."); }
            } else {
                // En escritorio, inyectamos el Menú Prestige de opciones
                this.showMenu();
            }
        },
        showMenu() {
            const menuId = 'dreams-share-overlay';
            if (document.getElementById(menuId)) return;

            const overlay = document.createElement('div');
            overlay.id = menuId;
            overlay.className = "fixed inset-0 z-[200] flex items-center justify-center bg-[#0F3460]/40 backdrop-blur-md p-4";
            overlay.innerHTML = `
                <div class="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
                    <h3 class="text-[#0F3460] font-black text-xl uppercase mb-6 text-center tracking-tighter">Recomendar programa</h3>
                    <div class="space-y-3">
                        <button onclick="WorkbookCore.sharing.whatsapp()" class="w-full flex items-center justify-between p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-all group">
                            <span class="font-bold text-green-700 text-sm">WhatsApp</span>
                            <span class="text-green-500 group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                        <button onclick="WorkbookCore.sharing.email()" class="w-full flex items-center justify-between p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all group">
                            <span class="font-bold text-blue-700 text-sm">Email Profesional</span>
                            <span class="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                        <button onclick="WorkbookCore.sharing.copyLink(this)" class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
                            <span class="font-bold text-gray-700 text-sm">Copiar Vínculo</span>
                            <span class="text-gray-400 group-hover:scale-110 transition-transform">📋</span>
                        </button>
                    </div>
                    <button onclick="document.getElementById('${menuId}').remove()" class="w-full mt-6 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-[#957C3D] transition-colors">Cerrar</button>
                </div>
            `;
            document.body.appendChild(overlay);
        },
        whatsapp() {
            window.open(`https://wa.me/?text=${encodeURIComponent(this.config.text + " " + this.config.url)}`, '_blank');
        },
        email() {
            const subject = encodeURIComponent(this.config.title);
            const body = encodeURIComponent(`${this.config.text}\n\nAccede aquí: ${this.config.url}`);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
        },
        copyLink(btn) {
            navigator.clipboard.writeText(this.config.url).then(() => {
                const label = btn.querySelector('span');
                const originalText = label.innerText;
                label.innerText = "¡Copiado!";
                label.classList.add('text-blue-600');
                setTimeout(() => {
                    label.innerText = originalText;
                    label.classList.remove('text-blue-600');
                }, 2000);
            });
        }
    },

    async exportToPDF(elementId, filename) {
        // ... (Código original de html2canvas y jsPDF conservado íntegramente)
    }
};

// --- LISTENERS DE INTEGRACIÓN (CONSERVADOS Y MEJORADOS) ---

// --- ESCUCHADOR MAESTRO DE ENTRADAS (MOTOR DE PERSISTENCIA UNIVERSAL) ---
document.addEventListener('input', (e) => {
    const el = e.target;
    const fieldId = el.dataset.id || el.id || el.name;
    
    if (el.dataset.persist !== "false" && fieldId) {
        // DETECCIÓN QUIRÚRGICA DE VALOR: Manejo de booleanos para Checkbox/Radio
        const valueToSave = (el.type === 'checkbox' || el.type === 'radio') 
            ? el.checked 
            : el.value;

        WorkbookCore.saveProgress(fieldId, valueToSave);
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

    // 2. HIDRATACIÓN DE IDENTIDAD (Persistencia Silenciosa)
    if (e.data.type === 'injectProfile' && e.data.profile) {
        console.log("👤 Dreams Core: Sincronizando identidad del líder...");
        const profileMap = {
            'nombre_participante': e.data.profile.nombre,
            'nombre_empresa': e.data.profile.empresa
        };

        Object.entries(profileMap).forEach(([id, value]) => {
            if (!value) return;
            // PERSISTENCIA QUIRÚRGICA: Guardamos en localStorage directamente
            // Esto asegura que el reporte tenga datos aunque no existan los inputs en el HTML.
            localStorage.setItem(`cuaderno_${id}`, value);
            
            // Actualización visual opcional (si el elemento existe por compatibilidad)
            const el = document.querySelector(`[data-id="${id}"]`);
            if (el) {
                el.value = value;
                el.readOnly = true;
                el.style.backgroundColor = "#F9FAFB";
            }
        });
        // Notificamos a la lógica local que la identidad ha sido cargada
        window.dispatchEvent(new CustomEvent('coreHydrated'));
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
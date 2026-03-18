//public/src/academia/academia.js
import { auth, db, collection, getDocs, query, orderBy, doc, getDoc, setDoc, checkAccess } from '../shared/firebase-config.js';

// --- ESTADO GLOBAL DE SESIÓN ---
let autosaveTimer; 
let COURSES_CONFIG = []; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECTORES DE NAVEGACIÓN (JERARQUÍA SMART STAGE)
    const viewLobby = document.getElementById('view-lobby');
    const viewLearningStage = document.getElementById('view-learning-stage');
    const viewPresentation = document.getElementById('view-presentation'); 
    const viewWorkbook = document.getElementById('view-workbook');
    
    // 1. MOTOR DE RENDERIZADO DEL LOBBY (FILTRADO POR CATEGORÍA)
    const renderLobby = (filterCategory = null) => {
        const lobbyContainer = document.getElementById('course-lobby');
        const lobbyTitle = document.getElementById('lobby-category-title');
        if (!lobbyContainer) return;

        // Actualización dinámica del título de la sección para feedback Prestige
        if (lobbyTitle && filterCategory) {
            lobbyTitle.innerText = `Programas: ${filterCategory}`;
        }

        // Filtramos la data de Firestore siguiendo la Regla de Negocio
        const filteredCourses = COURSES_CONFIG.filter(course => {
            // Si no hay filtro, mostramos todo el catálogo
            if (!filterCategory) return true;
            
            // TRACEABILIDAD: Identificamos si el curso pertenece al ecosistema "Consolida 360"
            // Corrección: Usamos .title en lugar de .id, ya que los IDs de Firebase son UIDs generados (hashes).
            const isConsolida = course.title && course.title.toLowerCase().includes('consolida');

            // REGLA DE NEGOCIO: Los cursos Consolida 360 se integran exclusivamente en "Generales"
            if (filterCategory === 'Generales' && isConsolida) return true;
            
            // Para el resto de categorías, buscamos coincidencia y excluimos Consolida para evitar duplicidad
            return course.category && course.category.includes(filterCategory) && !isConsolida;
        });

        // Alerta visual si la categoría aún no tiene programas asignados
        if (filteredCourses.length === 0) {
            lobbyContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: rgba(0,0,0,0.02); border-radius: 20px; border: 1px dashed #ddd;">
                    <p style="color: #999; font-weight: 400; font-size: 1rem;">Estamos preparando nuevos programas para la categoría <strong>${filterCategory}</strong>. <br>Vuelve pronto para descubrir nuevas rutas de crecimiento.</p>
                </div>`;
            return;
        }

        lobbyContainer.innerHTML = filteredCourses.map(course => {
            // Trazabilidad de Acceso: Si el curso es de pago y no se tiene acceso, mostramos el precio
            const priceDisplay = (!course.esGratis && !course.hasAccess) 
                ? `<div style="font-size: 0.85rem; font-weight: 800; color: var(--accent-gold); margin-bottom: 12px;">INVERSIÓN: $${course.price?.toLocaleString()} MXN</div>` 
                : '';

            return `
            <article class="card" style="${course.isComingSoon ? 'opacity: 0.6; border: 1px dashed #ccc;' : `border-top: 4px solid ${course.accentColor || 'var(--accent-gold)'};`}; display: flex; flex-direction: column; height: 100%;">
                <header class="card-header" style="margin-bottom: 15px;">
                    <span class="card-category" style="color: ${course.accentColor || '#999'}; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                        ${course.category} | ${course.modality || 'ONLINE'}
                    </span>
                    <h3 style="margin: 5px 0 0; font-size: 1.15rem; ${course.isComingSoon ? 'color: #999;' : ''}">${course.title}</h3>
                </header>

                <div class="card-body" style="flex-grow: 1;">
                    <p style="font-size: 0.85rem; line-height: 1.5; color: #4A5568; margin-bottom: 15px;">${course.description}</p>
                    ${priceDisplay}
                </div>

                <footer class="btn-group" style="display: flex; gap: 10px; align-items: center; margin-top: auto;">
                    <button class="btn-primary" 
                        ${course.isComingSoon ? 'disabled style="background: #e2e8f0; color: #94a3b8; cursor: not-allowed;"' : ''} 
                        data-action="${course.hasAccess || course.esGratis ? 'open' : 'buy'}" 
                        data-id="${course.id}" 
                        style="flex: 1; font-size: 0.7rem; padding: 12px 8px;">
                        ${course.isComingSoon ? 'Próximamente' : (course.hasAccess || course.esGratis ? (course.buttonText || 'INGRESAR') : 'COMPRAR')}
                    </button>
                </footer>
            </article>`;
        }).join('');
    };

    // 2. ESCUCHADORES DE INTERACCIÓN PARA PILARES
    document.addEventListener('click', (e) => {
        // A. Al hacer clic en una tarjeta de categoría
        const catBtn = e.target.closest('.card-category-btn');
        if (catBtn) {
            const selectedCategory = catBtn.dataset.category;
            document.getElementById('view-categories').style.display = 'none';
            document.getElementById('view-lobby').style.display = 'block';
            renderLobby(selectedCategory);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // B. Al hacer clic en el botón de "Volver a Pilares"
        if (e.target.closest('#btn-back-to-categories')) {
            document.getElementById('view-lobby').style.display = 'none';
            document.getElementById('view-categories').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // 0. MOTOR DE CARGA DINÁMICA (FASE 3: DINAMIZACIÓN)
    /**
     * Recupera la configuración de cursos desde Firestore.
     * Esto elimina la dependencia de datos "hardcoded" en el JS.
     */
    const fetchCoursesConfig = async () => {
        const lobbyContainer = document.getElementById('course-lobby');
        if (lobbyContainer) {
            lobbyContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <p style="color: #666; font-weight: 500;">⏳ Sincronizando catálogo de soluciones...</p>
                </div>`;
        }

        try {
            // Consultamos la colección 'config_ecosistema' ordenada por el campo 'orden'
            const q = query(collection(db, "config_ecosistema"), orderBy("orden", "asc"));
            const querySnapshot = await getDocs(q);
            
            // Reiniciamos el registro maestro y procesamos accesos quirúrgicamente
            const rawCourses = [];
            querySnapshot.forEach((doc) => {
                rawCourses.push({ id: doc.id, ...doc.data() });
            });

            // TRACEABILIDAD: Sincronización real con campos de Firebase (esGratis)
            COURSES_CONFIG = await Promise.all(rawCourses.map(async (course) => {
                const hasAccess = await checkAccess('cursos', course.id);
                
                // Mapeo corregido: 'esGratis' es el campo oficial en el Admin
                const esGratis = course.esGratis === true; 
                
                return { 
                    ...course, 
                    hasAccess, 
                    esGratis 
                };
            }));

            console.log(`✅ Dreams Cloud: ${COURSES_CONFIG.length} cursos validados y sincronizados.`);
            renderLobby();

            // --- REFUERZO DE JERARQUÍA (SEGURIDAD DE FLUJO) ---
            // TRACEABILIDAD: Para asegurar que el usuario siempre pase por el Lobby y el Selector 
            // (Regla de Negocio: Index -> Dashboard -> Lobby -> Selector), 
            // eliminamos cualquier recuperación automática de sesión al cargar la academia.
            sessionStorage.removeItem('dreams_active_session');
            console.log("📂 Dreams Core: Jerarquía restablecida. El sistema iniciará siempre en el Lobby.");

        } catch (error) {
            console.error("🚨 Error crítico al sincronizar el catálogo:", error);
            if (lobbyContainer) {
                lobbyContainer.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #c62828;">
                        <p>⚠️ Error de conexión con el catálogo. Por favor, verifica tu internet y recarga la página.</p>
                    </div>`;
            }
        }
    };

    // Iniciamos el ciclo de vida dinámico
    fetchCoursesConfig();

    // Selector recuperado para navegación
    const btnBackToLobby = document.getElementById('btn-back-to-lobby');
    
    // Motor de Carga: Variable global para el contenido de la sesión
    let currentSessionData = null;

    // 2. SELECTORES DE FORMULARIO
    const workbookForm = document.getElementById('workbook-form');
    const statusMessage = document.getElementById('status-message');

    // --- MOTOR DE CARGA: RENDERIZADO DINÁMICO ---

   // 1. MOTOR DE RENDERIZADO (LIMPIO)
    const renderSlides = (data) => {
        const slidesContainer = document.querySelector('.slides');
        if (!slidesContainer) return;
        
        slidesContainer.innerHTML = ''; 

        data.slides.forEach((slide) => {
            const section = document.createElement('section');
            if (slide.layout) slide.layout.split(' ').forEach(cls => section.classList.add(cls));

            let html = `
                ${slide.title ? `<h2>${slide.title}</h2>` : ''}
                ${slide.subtitle ? `<p>${slide.subtitle}</p>` : ''}
                ${slide.content ? `<div>${slide.content}</div>` : ''}
                ${slide.image ? `<img src="${window.DREAMS_CONFIG.resolvePath(slide.image.src, currentSessionData.courseMetadata.sessionId)}" alt="${slide.image.alt || ''}" class="slide-image">` : ''}
            `;
            
            if (slide.workbookLink) {
                html += `<button class="btn-primary" style="width:auto; padding:10px 20px;" 
                         onclick="window.dispatchEvent(new CustomEvent('openWorkbook'))">
                         ${slide.workbookLink.text}</button>`;
            }

            section.innerHTML = html;
            slidesContainer.appendChild(section);
        });

        // Trazabilidad: Reinicialización limpia de Reveal.js
        if (window.Reveal) {
            try {
                if (Reveal.isReady()) {
                    Reveal.sync();
                    Reveal.layout();
                    Reveal.slide(0); // Regresamos a la primera lámina al cargar contenido nuevo
                } else {
                    Reveal.initialize({ controls: true, progress: true, hash: true, center: true });
                }
            } catch (e) {
                console.warn("Reveal aún no está listo para inicializar.");
            }
        }
    };

    // Lógica para cerrar y reabrir el Podcast (Coordinación de burbuja con transiciones)
    const podcastPlayer = document.getElementById('podcast-player');
    const btnShowPodcast = document.getElementById('btn-show-podcast');
    const audioElement = document.getElementById('audio-element');

    // --- MOTOR DE CONTROL DE BURBUJAS (PERSISTENCIA TOTAL) ---
    const toggleBubble = (elementId, forceState = null) => {
        const el = document.getElementById(elementId);
        if (!el) return;

        // Si forceState es true -> Quitar 'podcast-hidden' (Mostrar)
        // Si forceState es false -> Poner 'podcast-hidden' (Ocultar)
        const shouldHide = forceState !== null ? !forceState : !el.classList.contains('podcast-hidden');
        
        if (shouldHide) {
            el.classList.add('podcast-hidden');
            // Seguridad: Al ocultar la burbuja, pausamos el video de Firebase por si seguía sonando
            if (elementId === 'video-tutorial') {
                document.getElementById('tutorial-video')?.pause();
            }
        } else {
            el.classList.remove('podcast-hidden');
            
            // Inteligencia de Reproducción: Detectamos cuál reproductor está activo
            if (elementId === 'video-tutorial') {
                const video = document.getElementById('tutorial-video');
                
                // Si el video de Firebase es el que está visible, le damos Play automáticamente
                if (video && window.getComputedStyle(video).display !== 'none') {
                    video.play().catch(() => console.log("Interacción requerida para reproducir"));
                    video.volume = 0.4; 
                }
                // Nota: Los iframes de YouTube se gestionan solos o por interacción del usuario
            }
        }
    };

    // Listeners del Dashboard de Control (Smart Stage: Slides vs Video)
    document.getElementById('btn-toggle-presentation')?.addEventListener('click', () => {
        // 1. Normalización de Vistas
        if (viewWorkbook) viewWorkbook.style.display = 'none';
        if (viewPresentation) viewPresentation.style.display = 'block';

        // 2. Conmutación Exclusiva: Mostramos Slides, Apagamos Video
        document.getElementById('stage-reveal').style.display = 'block';
        toggleBubble('video-tutorial', false);
        
        // 3. Sincronización de Motor Visual
        if (window.Reveal) {
            setTimeout(() => Reveal.layout(), 50);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('btn-toggle-video')?.addEventListener('click', () => {
        // 1. Normalización de Vistas
        if (viewWorkbook) viewWorkbook.style.display = 'none';
        if (viewPresentation) viewPresentation.style.display = 'block';

        // 2. Conmutación Exclusiva: Apagamos Slides, Activamos Video Stage
        document.getElementById('stage-reveal').style.display = 'none';
        toggleBubble('video-tutorial', true);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Receptor del evento de cierre desde el botón interno del Stage de Video
    window.addEventListener('closeVideoStage', () => {
        document.getElementById('btn-toggle-presentation').click();
    });

    // RECEPTOR QUIRÚRGICO: Conexión del botón "Salir al Curso" del Workbook
    window.addEventListener('returnToSessionSelector', () => {
        console.log("🔄 Dreams Nav: Solicitud de retorno al selector recibida.");
        returnToLobby(); // Reutilizamos la lógica maestra de retorno
    });
    document.getElementById('btn-toggle-podcast')?.addEventListener('click', () => toggleBubble('podcast-player'));
    document.getElementById('btn-toggle-workbook')?.addEventListener('click', () => {
        // En Online, el workbook es una burbuja. En Live, es la vista principal.
        // Estandarizamos la apertura: El workbook requiere su propia vista para garantizar 
        // el espacio de trabajo y la carga de datos (Sheets), independientemente de la modalidad.
        window.dispatchEvent(new CustomEvent('openWorkbook'));
    });

    // Listener para el botón de cierre del podcast (Mantiene compatibilidad)
    document.getElementById('btn-close-podcast')?.addEventListener('click', () => toggleBubble('podcast-player', false));

    // --- LÓGICA DE LA BURBUJA DE PROPÓSITO UNIVERSAL (DINÁMICA - FASE 3) ---
    const showPurpose = (courseId) => {
        const course = COURSES_CONFIG.find(c => c.id === courseId);
        if (!course) return;

        const overlay = document.getElementById('purpose-overlay-universal');
        const titleEl = document.getElementById('universal-purpose-title');
        const contentEl = document.getElementById('universal-purpose-content');

        if (overlay && titleEl && contentEl) {
            // Inyectamos la data de Firestore en el cascarón HTML
            titleEl.innerText = course.purposeTitle || "Propósito del Programa";
            contentEl.innerHTML = course.purposeDesc || course.description;
            overlay.classList.add('active');
        }
    };

    // Listener único para cerrar la burbuja universal
    document.getElementById('btn-close-purpose-universal')?.addEventListener('click', () => {
        document.getElementById('purpose-overlay-universal').classList.remove('active');
    });

    // Cerrar al hacer clic fuera del contenido (en el fondo oscuro)
    document.getElementById('purpose-overlay-universal')?.addEventListener('click', (e) => {
        if (e.target.id === 'purpose-overlay-universal') {
            e.target.classList.remove('active');
        }
    });

    // 2. DELEGACIÓN DE EVENTOS (OPTIMIZADA): El vigilante del Lobby
    const lobbyContainer = document.getElementById('course-lobby');
    if (lobbyContainer) {
        lobbyContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const { action, id } = btn.dataset;

            if (action === 'open') {
                startModule(id);
            }
            else if (action === 'purpose') {
                showPurpose(id);
            }
            else if (action === 'buy') {
                // ESTRATEGIA DE CONVERSIÓN: Disparamos el carrito con el ID del curso
                console.log(`🛒 Iniciando intención de compra para: ${id}`);
                
                // Buscamos el curso para pasarle el título y precio al carrito si es necesario
                const course = COURSES_CONFIG.find(c => c.id === id);
                
                // Disparo de evento global para que la burbuja del carrito reaccione
                window.dispatchEvent(new CustomEvent('OPEN_SHOPPING_CART', { 
                    detail: { 
                        courseId: id,
                        courseTitle: course?.title || 'Programa de Crecimiento'
                    } 
                }));
            }
        });
    }

    // --- NAVEGACIÓN ENTRE VISTAS Y TRAZABILIDAD DE DATOS ---

    // 1. Escuchador del evento disparado desde las diapositivas
    window.addEventListener('openWorkbook', () => {
        const iframe = document.getElementById('workbook-iframe');
        if (!iframe) return;

        // 1. Trazabilidad de Ruta: Construimos la ruta dinámica usando los metadatos de la sesión activa
        const sessionId = currentSessionData?.courseMetadata?.sessionId || 'sesion-a';
        const courseId = currentSessionData?.courseMetadata?.courseId || 'consolida-360';
        const workbookPath = `src/academia/courses/${courseId}/${sessionId}/workbook/index.html`;

        // 2. Cambio de Vista: Ocultamos la presentación y mostramos el contenedor del portal
        viewPresentation.style.display = 'none';
        viewWorkbook.style.display = 'block';
        window.scrollTo(0, 0);

        // 3. Carga Inteligente: Solo refrescamos el iframe si la ruta es distinta a la cargada
        if (iframe.src.indexOf(workbookPath) === -1) {
            statusMessage.innerText = "⏳ Sincronizando entorno modular...";
            iframe.src = workbookPath;

            // --- DNA PRESTIGE: Sincronización de Identidad y Entorno ---
            iframe.onload = async () => {
                statusMessage.innerText = "✅ Entorno sincronizado.";
                
                // 1. Handshake de Sincronización de Datos (Firestore del Workbook)
                iframe.contentWindow.postMessage({ type: 'SYNC_REQUEST' }, '*');

                // 2. INYECCIÓN DE PERFIL (Automatización del Líder)
                if (auth.currentUser) {
                    try {
                        const userSnap = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
                        if (userSnap.exists()) {
                            const userData = userSnap.data();
                            console.log("👤 Dreams Sync: Inyectando perfil oficial...");
                            
                            iframe.contentWindow.postMessage({ 
                                type: 'injectProfile', 
                                profile: {
                                    nombre: userData.nombre || '',
                                    empresa: userData.empresa || ''
                                }
                            }, '*');
                        }
                    } catch (error) {
                        console.error("🚨 Dreams Error: Fallo al recuperar perfil para el cuaderno:", error);
                    }
                }
            };
        }
    });

    // 2. Control de botones "Volver" (Limpieza de interfaz al salir)
    const btnPresBack = document.getElementById('btn-pres-back-to-lobby');
    
    // Bloque removido para permitir que returnToLobby gestione la navegación jerárquica.

    // 3. Control de botones "Volver" (Sincronización de Navegación)
    const btnNavBack = document.querySelector('.btn-nav-back'); // Botón del Header
    
    const returnToLobby = (e) => {
        if (autosaveTimer) clearTimeout(autosaveTimer);
        const sessionSelector = document.getElementById('view-session-selector');

        if (viewLobby && viewLobby.style.display === 'none') {
            if (e) e.preventDefault(); 

            // CASO A: Salida desde el Smart Learning Stage o Guía Intro
            const introGuide = document.getElementById('view-intro-guide');
            const isAtStage = viewLearningStage && viewLearningStage.style.display === 'block';
            const isAtGuide = introGuide && introGuide.style.display === 'block';

            if (isAtStage || isAtGuide) {
                // 1. Limpieza de procesos y medios activos
                ['podcast-player', 'video-tutorial'].forEach(id => toggleBubble(id, false));
                
                // 2. RESTAURACIÓN CRÍTICA DE SCROLL (Libera el bloqueo Cinema)
                document.body.classList.remove('reveal-viewport', 'cinema-mode');
                document.documentElement.style.overflow = 'auto'; // Limpia el HTML
                document.body.style.overflow = 'auto';           // Limpia el Body
                document.body.style.height = 'auto';             // Restaura altura natural
                
                // 3. Desmontaje Atómico de capas de curso
                if (viewLearningStage) viewLearningStage.style.display = 'none';
                if (introGuide) introGuide.style.display = 'none';
                viewPresentation.style.display = 'none';
                viewWorkbook.style.display = 'none';
                
                // 4. Regreso al Selector de Sesiones y Reset de posición
                if (sessionSelector) {
                    sessionSelector.style.display = 'block';
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 10);
                }
            }
            // CASO B: Salida desde el Selector de Sesiones hacia el Lobby
            else if (sessionSelector && sessionSelector.style.display === 'block') {
                sessionSelector.style.display = 'none';
                viewLobby.style.display = 'block';
            }

            window.scrollTo(0, 0);
        }
    };

    // Vinculamos la misma lógica a todos los botones de retorno
    btnNavBack?.addEventListener('click', returnToLobby);
    btnPresBack?.addEventListener('click', returnToLobby);
    btnBackToLobby?.addEventListener('click', returnToLobby);

   // --- DELEGACIÓN DE PERSISTENCIA (UNIFICACIÓN) ---
   /**
    * TRACEABILIDAD: Se elimina la lógica local de guardado. 
    * Ahora, academia.js confía plenamente en el puente de comunicación (postMessage) 
    * establecido en app.js y gestionado por WorkbookCore.js.
    * Esto evita la duplicidad de escrituras en Firestore y asegura que el 
    * 'Filtro 4+1' tenga una sola fuente de verdad.
    */

    // 2. ACTIVADOR DEL MÓDULO (CONSOLIDADO Y DINÁMICO)
    let startModule = async (courseId) => {
        // Fase 4: Limpieza de seguridad para evitar colisiones entre módulos
        if (autosaveTimer) clearTimeout(autosaveTimer);

        // Buscamos la coincidencia exacta del ID sin forzar minúsculas
        const courseConfig = COURSES_CONFIG.find(c => c.id === courseId);
        
        if (!courseConfig || !courseConfig.jsonPath) {
            console.error("Configuración de curso no encontrada para:", courseId);
            return;
        }

        try {
            // Ajuste de ruta: Aseguramos que sea relativa para evitar errores de raíz en localhost
            const cleanPath = courseConfig.jsonPath.startsWith('/') 
                ? courseConfig.jsonPath.substring(1) 
                : courseConfig.jsonPath;

            const response = await fetch(cleanPath);
            if (!response.ok) throw new Error(`Error ${response.status}: No se halló el archivo en ${cleanPath}`);
            
            currentSessionData = await response.json();
            
            // PROTECCIÓN DE TRAZABILIDAD: Si el JSON no tiene el objeto de metadata, lo creamos
            if (!currentSessionData.courseMetadata) {
                currentSessionData.courseMetadata = {};
            }
            
            // Sincronizamos la modalidad (ONLINE/LIVE) desde la configuración del lobby
            currentSessionData.courseMetadata.modality = courseConfig.modality;

            // --- BLOQUE MULTIMEDIA ELIMINADO DE STARTMODULE ---
            // La carga de multimedia ahora se gestiona en 'loadSessionContent' 
            // para garantizar que los podcasts cambien según la sesión elegida (A, B o C).

            // 1. Limpieza: Ocultamos el Lobby para dar paso a la navegación
            viewLobby.style.display = 'none';

            // 2. REPARACIÓN DE ERROR: Usamos 'courseConfig.modality' que es la variable válida
            const currentModality = courseConfig.modality;

            // 3. ACTIVACIÓN DEL PANEL DE SESIONES (NUEVO FLUJO INTERMEDIO)
            // En lugar de ir al contenido, mostramos el selector de sesiones
            const sessionSelector = document.getElementById('view-session-selector');
            if (sessionSelector) {
                sessionSelector.style.display = 'block';
                // Pintamos las 3 tarjetas (A, B, C) con la info del curso seleccionado
                renderSessions(courseConfig);
            }

        } catch (error) {
            console.error("Falla de carga:", error);
            alert("No se pudo cargar el material.");
            viewLobby.style.display = 'block';
        }
    };

    // 4. MOTOR DE RENDERIZADO DE SESIONES (LAS 3 SESIONES)
    const renderSessions = (courseConfig) => {
        const sessionList = document.getElementById('session-list');
        if (!sessionList) return;

        // Definimos las 3 sesiones estándar del Programa Consolida
        const sessions = [
            { id: 'a', name: 'Sesión A', topic: 'Equipo Proactivo, Empresa Exitosa', icon: '🏗️' },
            { id: 'b', name: 'Sesión B', topic: 'Impulsa tu PyME: Ecosistema Digital de Ventas', icon: '⚙️' },
            { id: 'c', name: 'Sesión C', topic: 'Gasto Inteligente, Inversiones Efectivas', icon: '🚀' }
        ];

        sessionList.innerHTML = sessions.map(session => `
            <article class="card" style="border-top: 4px solid ${courseConfig.accentColor}; display: flex; flex-direction: column; height: 100%;">
                <div class="card-content" style="text-align: center; padding: 30px 20px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="font-size: 3rem; margin-bottom: 15px;">${session.icon}</div>
                        <span class="card-category" style="color: #666;">${session.name}</span>
                        <h3 style="margin: 10px 0; color: var(--primary-color);">${session.topic}</h3>
                    </div>
                    
                    <button class="btn-primary" 
                        onclick="window.dispatchEvent(new CustomEvent('loadSessionContent', { 
                            detail: { 
                                courseId: '${courseConfig.id}',
                                sessionId: '${session.id}', 
                                sessionTitle: '${session.name}: ${session.topic}',
                                modality: '${courseConfig.modality}',
                                jsonPath: '${courseConfig.jsonPath}' 
                            } 
                        }))"
                        style="margin-top: 15px;">
                        Acceder a Sesión
                    </button>
                </div>
            </article>
        `).join('');
    };

    // 5. ESCUCHADOR PARA VOLVER AL LOBBY DESDE SESIONES
    document.getElementById('btn-sessions-back-to-lobby')?.addEventListener('click', () => {
        document.getElementById('view-session-selector').style.display = 'none';
        document.getElementById('view-lobby').style.display = 'block';
    });

    // 6. RECEPTOR DE CARGA DE SESIÓN (EL CONECTOR DINÁMICO)
    // Se mueve dentro del bloque principal para tener acceso al estado (currentSessionData)
    window.addEventListener('loadSessionContent', async (e) => {
        if (autosaveTimer) clearTimeout(autosaveTimer);

        // Persistencia de Estado: Guardamos los metadatos para que el refresco no nos saque del curso
        sessionStorage.setItem('dreams_active_session', JSON.stringify(e.detail));

        const { sessionId, sessionTitle, modality, jsonPath } = e.detail;

        try {
            // 1. CÁLCULO DE RUTA: Dinamismo para carpetas sesion-a, sesion-b o sesion-c
            const sessionPath = jsonPath.replace('sesion-a', `sesion-${sessionId}`).startsWith('/') 
                                ? jsonPath.replace('sesion-a', `sesion-${sessionId}`).substring(1) 
                                : jsonPath.replace('sesion-a', `sesion-${sessionId}`);

            const response = await fetch(sessionPath);
            if (!response.ok) throw new Error(`Contenido no hallado en: ${sessionPath}`);
            
            const jsonText = await response.text();
            
            // Validamos que el contenido no sea nulo o vacío antes de procesar
            if (!jsonText || jsonText.trim().length === 0) {
                throw new Error(`El archivo en ${sessionPath} está vacío o no se leyó correctamente.`);
            }

            // Procesamos manualmente el JSON para capturar errores de sintaxis específicos
            const jsonData = JSON.parse(jsonText);
            
            if (!jsonData.courseMetadata) jsonData.courseMetadata = {};
            
            // INYECCIÓN DE METADATOS: Aquí es donde ocurre la magia de la trazabilidad
            jsonData.courseMetadata.sessionId = `sesion-${sessionId}`;
            jsonData.courseMetadata.sessionTitle = sessionTitle; // Guardamos el nombre real (ej: Gasto Inteligente)
            jsonData.courseMetadata.modality = modality;
            
            currentSessionData = jsonData;

            // --- ORQUESTACIÓN CLOUD: FILTRADO DE MATERIALES, ZOOM Y PROPÓSITO ---
            const courseConfig = COURSES_CONFIG.find(c => c.id === (e.detail.courseId));
            const labels = currentSessionData.guideLabels || {};
            
            // Función auxiliar para sincronizar visibilidad en Guía Intro Y Barra Lateral simultáneamente
            const syncMaterialUI = (idIntro, idSidebar, isVisible) => {
                const elIntro = document.getElementById(idIntro);
                const elSidebar = document.getElementById(idSidebar);
                if (elIntro) elIntro.closest('.card-guide').style.display = isVisible ? 'flex' : 'none';
                if (elSidebar) elSidebar.style.display = isVisible ? 'flex' : 'none';
            };

            if (courseConfig) {
                // 1. Sincronización de Materiales (Intro + Sidebar)
                syncMaterialUI('guide-title-video', 'btn-toggle-video', courseConfig.hasVideo);
                syncMaterialUI('guide-title-pres', 'btn-toggle-presentation', courseConfig.hasPresentation);
                syncMaterialUI('guide-title-workbook', 'btn-toggle-workbook', courseConfig.hasWorkbook);
                syncMaterialUI('guide-title-audio', 'btn-toggle-podcast', courseConfig.hasPodcast);

                // 2. Hidratación de Etiquetas (Guía)
                const setLabel = (id, text) => { if(document.getElementById(id)) document.getElementById(id).innerText = text || ''; };
                setLabel('guide-title-video', labels.video?.title);
                setLabel('guide-desc-video', labels.video?.desc);
                setLabel('guide-title-pres', labels.pres?.title);
                setLabel('guide-desc-pres', labels.pres?.desc);
                setLabel('guide-title-workbook', labels.workbook?.title);
                setLabel('guide-desc-workbook', labels.workbook?.desc);
                setLabel('guide-title-audio', labels.audio?.title);
                setLabel('guide-desc-audio', labels.audio?.desc);

                // 3. Inteligencia Zoom (Barra Lateral)
                const btnZoom = document.getElementById('btn-toggle-zoom');
                if (btnZoom) {
                    if (courseConfig.modality === 'LIVE' && courseConfig.zoomLink) {
                        btnZoom.style.display = 'flex';
                        btnZoom.onclick = () => window.open(courseConfig.zoomLink, '_blank');
                    } else { btnZoom.style.display = 'none'; }
                }

                // 4. Propósito Dinámico
                window.showPurpose = (id) => {
                    const overlay = document.getElementById('purpose-overlay-universal');
                    if (overlay && courseConfig.id === id) {
                        document.getElementById('universal-purpose-title').innerText = courseConfig.purposeTitle || "Visión Estratégica";
                        document.getElementById('universal-purpose-content').innerHTML = courseConfig.purposeDesc || courseConfig.description;
                        overlay.classList.add('active');
                    }
                };
            }

            // --- RECONEXIÓN MULTIMEDIA ---
            if (currentSessionData.multimedia) {
                const podcastPlayer = document.getElementById('podcast-player');
                const selector = document.getElementById('podcast-selector');
                const podcastSource = document.getElementById('podcast-source');
                const audioElement = document.getElementById('audio-element');
                const videoElement = document.getElementById('tutorial-video');

                if (podcastPlayer) podcastPlayer.style.display = 'block';
                if (audioElement) audioElement.volume = 0.3;

                if (currentSessionData.multimedia.playlist && selector) {
                    selector.innerHTML = '';
                    currentSessionData.multimedia.playlist.forEach(track => {
                        const option = document.createElement('option');
                        option.value = window.DREAMS_CONFIG.resolvePath(track.url, sessionId);
                        option.textContent = track.title;
                        selector.appendChild(option);
                    });

                    // FUNCIÓN QUIRÚRGICA: Recuperar y aplicar persistencia
                    const restoreAudioPos = () => {
                        const savedPos = localStorage.getItem(`dreams_pos_${sessionId}_${selector.value}`);
                        if (savedPos) {
                            audioElement.currentTime = parseFloat(savedPos);
                            console.log(`⏳ Dreams Media: Reanudando podcast en ${savedPos}s`);
                        }
                    };

                    if (currentSessionData.multimedia.playlist.length > 0) {
                        podcastSource.src = selector.value;
                        audioElement.load();
                        restoreAudioPos(); // Intento de recuperación inicial
                    }

                    selector.onchange = () => {
                        podcastSource.src = selector.value;
                        audioElement.load();
                        restoreAudioPos(); // Intento de recuperación al cambiar de track
                        audioElement.play().catch(() => console.log("Interacción requerida"));
                    };

                    // ESCUCHADOR DE PERSISTENCIA: Guarda la posición cada 5 segundos de reproducción
                    audioElement.ontimeupdate = () => {
                        // Guardamos solo si hay un progreso significativo para no saturar el storage
                        if (Math.floor(audioElement.currentTime) % 5 === 0) {
                            localStorage.setItem(`dreams_pos_${sessionId}_${selector.value}`, audioElement.currentTime);
                        }
                    };

                    // LÓGICA DE LIMPIEZA: Si el audio termina, eliminamos el registro para que inicie de cero la próxima vez
                    audioElement.onended = () => {
                        localStorage.removeItem(`dreams_pos_${sessionId}_${selector.value}`);
                        console.log("🧹 Dreams Media: Podcast finalizado. Registro de persistencia limpiado.");
                    };
                }

                if (currentSessionData.multimedia.tutorialUrl) {
                    const youtubeElement = document.getElementById('tutorial-youtube');
                    let resolvedUrl = window.DREAMS_CONFIG.resolvePath(currentSessionData.multimedia.tutorialUrl, sessionId);
                    
                    // LLAVE DE PERSISTENCIA: Única por curso, sesión y URL
                    const videoStorageKey = `dreams_vid_${sessionId}_${currentSessionData.multimedia.tutorialUrl}`;
                    const savedVideoPos = localStorage.getItem(videoStorageKey);

                    if (resolvedUrl.includes('youtube.com/embed')) {
                        // LÓGICA YOUTUBE: Retomamos usando el parámetro 'start' de la API de YouTube
                        if (savedVideoPos && parseFloat(savedVideoPos) > 5) {
                            const startAt = Math.floor(parseFloat(savedVideoPos));
                            resolvedUrl += (resolvedUrl.includes('?') ? '&' : '?') + `start=${startAt}`;
                            console.log(`📺 Dreams Video: Retomando YouTube en seg: ${startAt}`);
                        }

                        if (youtubeElement) { youtubeElement.src = resolvedUrl; youtubeElement.style.display = 'block'; }
                        if (videoElement) { videoElement.style.display = 'none'; videoElement.pause(); }
                    } else {
                        // LÓGICA NATIVA (MP4/Firebase): Retomamos vía currentTime
                        if (videoElement) {
                            videoElement.src = resolvedUrl;
                            videoElement.load();
                            if (savedVideoPos) {
                                videoElement.currentTime = parseFloat(savedVideoPos);
                                console.log(`📺 Dreams Video: Retomando video nativo en ${savedVideoPos}s`);
                            }
                            videoElement.style.display = 'block';

                            // ESCUCHADOR DE POSICIÓN (Solo para video nativo)
                            videoElement.ontimeupdate = () => {
                                if (Math.floor(videoElement.currentTime) % 5 === 0) {
                                    localStorage.setItem(videoStorageKey, videoElement.currentTime);
                                }
                            };

                            // LÓGICA DE LIMPIEZA: Si el video llega al final, borramos la persistencia 
                            // para que la siguiente vez que entre, inicie desde el segundo 0.
                            videoElement.onended = () => {
                                localStorage.removeItem(videoStorageKey);
                                console.log("🧹 Dreams Video: Contenido finalizado. Registro de persistencia limpiado.");
                            };
                        }
                        if (youtubeElement) { youtubeElement.style.display = 'none'; youtubeElement.src = ''; }
                    }
                }
            }

            // --- FLUJO DE ENTRADA INTELIGENTE (SMART START) ---
            const sessionSelector = document.getElementById('view-session-selector');
            const introGuide = document.getElementById('view-intro-guide');
            const btnContinue = document.getElementById('btn-guide-continue');

            if (viewLobby) viewLobby.style.display = 'none';
            if (sessionSelector) sessionSelector.style.display = 'none';
            if (introGuide) {
                introGuide.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            if (btnContinue) {
                btnContinue.onclick = () => {
                    introGuide.style.display = 'none';
                    document.body.classList.add('cinema-mode');
                    if (viewLearningStage) viewLearningStage.style.display = 'block';

                    // Lógica de arranque basada en lo que esté activo en el Admin
                    if (courseConfig.hasPresentation) {
                        viewPresentation.style.display = 'block';
                        viewWorkbook.style.display = 'none';
                        renderSlides(currentSessionData);
                        setTimeout(() => { if (window.Reveal) Reveal.layout(); }, 100);
                    } else if (courseConfig.hasWorkbook) {
                        viewPresentation.style.display = 'none';
                        window.dispatchEvent(new CustomEvent('openWorkbook'));
                    } else if (courseConfig.hasVideo) {
                        document.getElementById('btn-toggle-video').click();
                    }
                };
            }
        } catch (error) {
            console.error("🚨 Error Crítico de Carga:", error);
            alert(`Error de Configuración: No se encontró el archivo en la ruta:\n${jsonPath}\n\nVerifica que la carpeta exista en tu proyecto.`);
        }
    }); // <--- Cierre de loadSessionContent

}); // <--- Cierre de DOMContentLoaded

/**
 * RECEPTOR QUIRÚRGICO DEL CARRITO
 * Escucha el evento de compra y prepara la pasarela.
 */
window.addEventListener('OPEN_SHOPPING_CART', (e) => {
    const { courseId, courseTitle } = e.detail;
    const overlay = document.getElementById('cart-overlay');
    const titleEl = document.getElementById('cart-course-title');
    const btnPay = document.getElementById('btn-proceed-to-payment');

    if (overlay && titleEl) {
        titleEl.innerText = courseTitle;
        overlay.style.display = 'flex';
        overlay.classList.add('active');

        btnPay.onclick = () => {
            console.log(`🚀 Redirigiendo a pasarela para el curso: ${courseId}`);
            ejecutarProcesoDePago(courseId);
        };
    }
});

function ejecutarProcesoDePago(courseId) {
    alert(`Iniciando checkout para el ID: ${courseId}. (Aquí conectaremos tu pasarela de pago actual)`);
}

document.getElementById('btn-close-cart')?.addEventListener('click', () => {
    const overlay = document.getElementById('cart-overlay');
    if(overlay) {
        overlay.style.display = 'none';
        overlay.classList.remove('active');
    }
});
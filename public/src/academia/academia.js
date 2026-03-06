//public/src/academia/academia.js
import { auth, db, collection, getDocs, query, orderBy, doc, setDoc } from '../shared/firebase-config.js';

// --- ESTADO GLOBAL DE SESIÓN ---
let autosaveTimer; 
let COURSES_CONFIG = []; // Se poblará dinámicamente desde Firestore (Fase 3)

document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECTORES DE NAVEGACIÓN
    const viewLobby = document.getElementById('view-lobby');
    const viewPresentation = document.getElementById('view-presentation'); // El contenedor de Reveal.js
    const viewWorkbook = document.getElementById('view-workbook');
    
    // 1. MOTOR DE RENDERIZADO DEL LOBBY (DINÁMICO)
    const renderLobby = () => {
        const lobbyContainer = document.getElementById('course-lobby');
        if (!lobbyContainer) return;

        lobbyContainer.innerHTML = COURSES_CONFIG.map(course => `
            <article class="card" style="${course.isComingSoon ? 'opacity: 0.6; border: 1px dashed #ccc;' : `border-top: 4px solid ${course.accentColor || 'var(--accent-gold)'};`}; display: flex; flex-direction: column; height: 100%;">
                <header class="card-header" style="margin-bottom: 15px;">
                    <span class="card-category" style="color: ${course.accentColor || '#999'}; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                        ${course.category}
                    </span>
                    <h3 style="margin: 5px 0 0; font-size: 1.15rem; ${course.isComingSoon ? 'color: #999;' : ''}">${course.title}</h3>
                </header>

                <div class="card-body" style="flex-grow: 1;">
                    <p style="font-size: 0.85rem; line-height: 1.5; color: #4A5568; margin-bottom: 20px;">${course.description}</p>
                </div>

                <footer class="btn-group" style="display: flex; gap: 10px; align-items: center; margin-top: auto;">
                    ${!course.isComingSoon ? `
                        <button class="btn-primary" data-action="purpose" data-id="${course.id}" style="margin-top: 0; flex: 1; font-size: 0.65rem; padding: 8px 5px; white-space: nowrap; text-align: center; background: none; color: var(--primary-midnight); border: 1.5px solid var(--primary-midnight);">
                            PROPOSITO
                        </button>
                    ` : ''}
                    <button class="btn-primary" 
                        ${course.isComingSoon ? 'disabled style="background: #e2e8f0; color: #94a3b8; cursor: not-allowed; box-shadow: none;"' : ''}
                        data-action="open" 
                        data-id="${course.id}"
                        style="flex: 1.5; font-size: 0.7rem; padding: 12px 8px;">
                        ${course.isComingSoon ? 'Próximamente' : course.buttonText}
                    </button>
                </footer>
            </article>
        `).join('');
    };

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
            
            // Reiniciamos el registro maestro con los datos frescos de la nube
            COURSES_CONFIG = [];
            querySnapshot.forEach((doc) => {
                COURSES_CONFIG.push({ 
                    id: doc.id, 
                    ...doc.data() 
                });
            });

            console.log(`✅ Dreams Cloud: ${COURSES_CONFIG.length} cursos sincronizados.`);
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

    // Listeners del Dashboard de Control (Navegación Online)
    document.getElementById('btn-toggle-video')?.addEventListener('click', () => toggleBubble('video-tutorial'));
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
                // Mantenemos el ID original (Case Sensitive) para asegurar la trazabilidad con Firestore
                startModule(id);
            }
            else if (action === 'purpose') {
                // Ahora llamamos a la función dinámica en lugar de buscar un ID estático
                showPurpose(id);
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

            // --- INICIO DE MODIFICACIÓN QUIRÚRGICA ---
            // Escuchamos cuando el contenido interno del iframe termine de cargar
            iframe.onload = () => {
                statusMessage.innerText = "✅ Entorno sincronizado.";
                // Enviamos la señal al workbook de que el "padre" (Academia) está listo
                iframe.contentWindow.postMessage({ type: 'SYNC_REQUEST' }, '*');
            };
            // --- FIN DE MODIFICACIÓN QUIRÚRGICA ---
        }
    });

    // 2. Control de botones "Volver" (Limpieza de interfaz al salir)
    const btnPresBack = document.getElementById('btn-pres-back-to-lobby');
    
    // Bloque removido para permitir que returnToLobby gestione la navegación jerárquica.

    // 3. Control de botones "Volver" (Sincronización de Navegación)
    const btnNavBack = document.querySelector('.btn-nav-back'); // Botón del Header
    
    const returnToLobby = (e) => {
        // Fase 4: Cancelamos cualquier guardado pendiente antes de cambiar de vista
        if (autosaveTimer) clearTimeout(autosaveTimer);

        const sessionSelector = document.getElementById('view-session-selector');

        // Solo intervenimos si el Lobby está oculto (estamos dentro de un curso o sesión)
        if (viewLobby && viewLobby.style.display === 'none') {
            if (e) e.preventDefault(); 

            // CASO A: Si estamos viendo contenido (Presentación o Cuaderno), volvemos al Selector de Sesiones
            if (viewPresentation.style.display === 'block' || viewWorkbook.style.display === 'block') {
                ['podcast-player', 'video-tutorial'].forEach(id => toggleBubble(id, false));
                
                viewPresentation.style.display = 'none';
                viewWorkbook.style.display = 'none';
                if (sessionSelector) sessionSelector.style.display = 'block';

                // Restauramos la interfaz (quitamos modo cinema) para ver el selector correctamente
                document.body.classList.remove('reveal-viewport', 'cinema-mode');
                document.body.removeAttribute('style');
            } 
            // CASO B: Si ya estamos en el Selector de Sesiones, volvemos al Catálogo (Lobby)
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

            // --- RECONEXIÓN QUIRÚRGICA DE MULTIMEDIA (SESIÓN A/B/C) ---
            if (currentSessionData.multimedia) {
                const podcastPlayer = document.getElementById('podcast-player');
                const selector = document.getElementById('podcast-selector');
                const podcastSource = document.getElementById('podcast-source');
                const audioElement = document.getElementById('audio-element');
                const videoElement = document.getElementById('tutorial-video');

                // 1. Visibilidad y Confort (Volumen)
                if (podcastPlayer) podcastPlayer.style.display = 'block';
                if (audioElement) audioElement.volume = 0.3;

                // 2. Sincronización de Playlist (Podcast)
                if (currentSessionData.multimedia.playlist && selector) {
                    selector.innerHTML = '';
                    currentSessionData.multimedia.playlist.forEach(track => {
                        const option = document.createElement('option');
                        // Usamos el motor central para obtener la URL de Firebase
                        // Validación preventiva para evitar colapso del sistema
                        if (window.DREAMS_CONFIG && typeof window.DREAMS_CONFIG.resolvePath === 'function') {
                            option.value = window.DREAMS_CONFIG.resolvePath(track.url, sessionId);
                        } else {
                            console.error("🚨 Error Crítico: Motor de rutas no inicializado.");
                            option.value = track.url; // Fallback al nombre del archivo
                        }
                        option.textContent = track.title;
                        selector.appendChild(option);
                    });

                    // Carga inicial y Restauración de interactividad (onchange)
                    if (currentSessionData.multimedia.playlist.length > 0) {
                        podcastSource.src = selector.value;
                        audioElement.load();
                    }
                    selector.onchange = () => {
                        podcastSource.src = selector.value;
                        audioElement.load();
                        audioElement.play().catch(() => console.log("Interacción requerida para audio"));
                    };
                }

                // 3. Sincronización de Video (Tutorial de Sesión)
                if (currentSessionData.multimedia.tutorialUrl) {
                    const youtubeElement = document.getElementById('tutorial-youtube');
                    const resolvedUrl = window.DREAMS_CONFIG.resolvePath(currentSessionData.multimedia.tutorialUrl, sessionId);

                    if (resolvedUrl.includes('youtube.com/embed')) {
                        // MODO YOUTUBE: Activamos iframe, ocultamos video nativo
                        if (youtubeElement) {
                            youtubeElement.src = resolvedUrl;
                            youtubeElement.style.display = 'block';
                        }
                        if (videoElement) {
                            videoElement.style.display = 'none';
                            videoElement.pause(); // Seguridad: Evita audio duplicado
                        }
                    } else {
                        // MODO FIREBASE/MP4: Activamos video nativo, ocultamos iframe
                        if (videoElement) {
                            videoElement.src = resolvedUrl;
                            videoElement.load();
                            videoElement.style.display = 'block';
                        }
                        if (youtubeElement) {
                            youtubeElement.style.display = 'none';
                            youtubeElement.src = ''; // Limpiamos para detener carga de YT
                        }
                    }
                }
            }

            // 4. LIMPIEZA Y ENRUTAMIENTO 
            // Ocultamos tanto el Lobby como el Selector de Sesiones para evitar el solapamiento visual
            if (viewLobby) viewLobby.style.display = 'none';
            const sessionSelector = document.getElementById('view-session-selector');
            if (sessionSelector) sessionSelector.style.display = 'none';
            
            // ACTIVACIÓN DE MODO CINEMA (Quirúrgico): Oculta Navbar y expande contenedores
            document.body.classList.add('cinema-mode');

            if (modality === 'ONLINE') {
                viewPresentation.style.display = 'block';
                renderSlides(currentSessionData);
                
                // Forzamos a Reveal a recalcular dimensiones después de que el contenedor es visible
                setTimeout(() => {
                    if (window.Reveal) {
                        Reveal.layout();
                    }
                }, 100); 
            } else {
                window.dispatchEvent(new CustomEvent('openWorkbook'));
            }
        } catch (error) {
            console.error("Falla de conexión de sesión:", error);
            alert("Aviso: El contenido de esta sesión aún no está disponible en el servidor.");
        }
    });

});
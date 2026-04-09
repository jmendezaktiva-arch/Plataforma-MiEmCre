//public/src/academia/academia.js
import { auth, db, collection, getDocs, query, orderBy, doc, getDoc, setDoc, checkAccess } from '../shared/firebase-config.js';

/**
 * Vista de pilares (#view-categories): copy y botones INGRESAR por eje en
 * public/academia.html (.academia-pillars-list li.card-category-btn). Estilos en bento.css.
 * Cada <li class="card-category-btn"> en .academia-pillars-list debe llevar data-category
 * alineado con course.category en Firestore y con filterCategory en renderLobby
 * (Dirección, Productividad, Liderazgo, Comercial, Generales).
 */

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
            // Saneamiento: La etiqueta de precio ahora usa una clase CSS dedicada
            const priceDisplay = (!course.esGratis && !course.hasAccess) 
                ? `<div class="card-price-tag">INVERSIÓN: $${course.price?.toLocaleString()} MXN</div>` 
                : '';

            // Lógica de Etiqueta Dinámica: Prioriza el Admin pero mantiene estados de seguridad
            const defaultActionLabel = course.modality === 'LIVE' ? 'ACCEDER A MENTORÍA' : 'ACCEDER AL PROGRAMA';
            const buttonLabel = course.isComingSoon 
                ? 'PRÓXIMAMENTE' 
                : (!course.hasAccess && !course.esGratis)
                    ? 'ADQUIRIR AHORA'
                    : (course.buttonText || defaultActionLabel);

            return `
            <article class="card bento-item glass-card card-lobby-item ${course.isComingSoon ? 'locked-opacity' : ''}" 
                     style="border-top-color: ${course.accentColor || 'var(--accent-gold)'};">
                
                <div class="card-content">
                    <header class="card-header-app">
                        <span class="card-category">
                            ${course.category} | ${course.modality}
                        </span>
                        <h3 class="card-title-app">${course.title}</h3>
                    </header>

                    <div class="card-body-app">
                        <div class="roadmap-link" data-roadmap-target="popover-${course.id}" style="color: ${course.accentColor || 'var(--accent-gold)'}">
                            <span>+ ${course.purposeTitle || 'VER ROADMAP ESTRATÉGICO'}</span>
                        </div>
                        
                        ${course.description && course.description !== 'En desarrollo' ? `
                            <div class="description-popover" id="popover-${course.id}">
                                <p>${course.description}</p>
                            </div>
                        ` : ''}

                        ${priceDisplay}
                    </div>

                    <footer class="card-footer-app">
                        <button class="btn-primary btn-lobby-action" 
                            ${course.isComingSoon ? 'disabled' : ''} 
                            data-action="${course.hasAccess || course.esGratis ? 'open' : 'buy'}" 
                            data-id="${course.id}">
                            ${buttonLabel}
                        </button>
                    </footer>
                </div>
            </article>`;
        }).join('');

        // --- MOTOR DE DESPLIEGUE EXCLUSIVO (ESTILO APPS FOCUS) ---
        setTimeout(() => {
            const courseCards = lobbyContainer.querySelectorAll('.card');
            courseCards.forEach((card, i) => {
                // Animación de entrada
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                card.style.transition = `all 0.6s ease ${i * 0.1}s`;
                
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });

                // MOTOR DE FOCO PRESTIGE (Optimizado por Clases CSS)
                card.addEventListener('mouseenter', () => {
                    courseCards.forEach(c => {
                        const body = c.querySelector('.card-body-app');
                        const footer = c.querySelector('.card-footer-app');
                        
                        if (c !== card) {
                            c.classList.add('card-inactive');
                            c.classList.remove('card-active', 'card-expanded');
                            if(body) body.classList.remove('card-content-visible');
                            if(footer) footer.classList.remove('card-content-visible');
                        } else {
                            c.classList.add('card-active', 'card-expanded');
                            c.classList.remove('card-inactive');
                            if(body) body.classList.add('card-content-visible');
                            if(footer) footer.classList.add('card-content-visible');
                        }
                    });
                });

                card.addEventListener('mouseleave', (e) => {
                    // Si el mouse sale de la tarjeta y no se dirige a su propio popover, reseteamos todo
                    const movingToPopover = e.relatedTarget && e.relatedTarget.closest('.description-popover');
                    if (movingToPopover) return;

                    courseCards.forEach(c => {
                        const popover = c.querySelector('.description-popover');
                        const body = c.querySelector('.card-body-app');
                        const footer = c.querySelector('.card-footer-app');
                        
                        // RESET ATÓMICO: Cerramos burbujas y restauramos nitidez global
                        if (popover) popover.classList.remove('active');
                        c.classList.remove('card-active', 'card-inactive', 'card-expanded');
                        
                        if(body) body.classList.remove('card-content-visible');
                        if(footer) footer.classList.remove('card-content-visible');
                    });
                });
            });
        }, 50);
    };

    // 2. MOTOR DE INTERACCIÓN DE PILARES (lista única con INGRESAR en cada recuadro)
    const pillarsList = document.querySelector('#view-categories .academia-pillars-list');
    if (pillarsList) {
        const cards = pillarsList.querySelectorAll('li.card-category-btn');

        cards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `all 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${i * 0.1}s`;
            requestAnimationFrame(() => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            });
        });

        pillarsList.addEventListener('mouseover', (e) => {
            const hoveredCard = e.target.closest('li.card-category-btn');
            if (!hoveredCard || !pillarsList.contains(hoveredCard)) return;

            cards.forEach((card) => {
                card.style.transition = 'all 0.4s ease';
                if (card !== hoveredCard) {
                    card.style.filter = 'blur(4px) grayscale(0.25)';
                    card.style.opacity = '0.45';
                    card.style.transform = 'scale(0.99)';
                } else {
                    card.style.filter = 'none';
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1.01)';
                    card.style.zIndex = '2';
                }
            });
        });

        pillarsList.addEventListener('mouseleave', () => {
            cards.forEach((card) => {
                card.style.filter = 'none';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                card.style.zIndex = '1';
            });
        });
    }

    // D. Gestión de Navegación por Clic (Sincronizada con Header Aura)
    document.addEventListener('click', (e) => {
        const catBtn = e.target.closest('.card-category-btn');
        const headerTitle = document.getElementById('header-aura-title'); // Sincronización con Header Aura
        const globalBackBtn = document.getElementById('btn-global-back');
        const brandLogo = document.getElementById('header-logo-brand');

        // 1. Entrada a Categoría
        if (catBtn) {
            const selectedCategory = catBtn.dataset.category;
            
            document.getElementById('view-categories').style.display = 'none';
            document.getElementById('view-lobby').style.display = 'block';
            
            // FEEDBACK VISUAL: Ocultamos logo para dar prioridad al título en navegación profunda
            if (brandLogo) brandLogo.style.display = 'none';
            if (headerTitle) {
                headerTitle.innerText = `PROGRAMAS: ${selectedCategory.toUpperCase()}`;
                headerTitle.style.opacity = "1";
            }
            if (globalBackBtn) globalBackBtn.style.display = 'block';

            renderLobby(selectedCategory);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // 2. Lógica de Retroceso Dinámico (Lobby -> Categorías)
        const isBackToCats = e.target.closest('#btn-back-to-categories') || e.target.closest('#btn-global-back');
        if (isBackToCats) {
            // Solo ejecutamos este retroceso si el usuario está viendo el Lobby de cursos
            const viewLobby = document.getElementById('view-lobby');
            if (viewLobby && viewLobby.style.display === 'block') {
                viewLobby.style.display = 'none';
                document.getElementById('view-categories').style.display = 'block';
                
                // RESET DE INTERFAZ: Restauramos logo y título base
                if (brandLogo) brandLogo.style.display = 'flex';
                if (headerTitle) headerTitle.innerText = 'Academia Dreams';
                if (globalBackBtn) globalBackBtn.style.display = 'none';
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        // --- MOTOR DE POP-OVERS DE ROADMAP (QUIRÚRGICO) ---
        const roadmapTrigger = e.target.closest('.roadmap-link');
        
        // 1. Lógica de Apertura
        if (roadmapTrigger) {
            e.preventDefault();
            const targetId = roadmapTrigger.dataset.roadmapTarget;
            const popover = document.getElementById(targetId);

            // Cerramos cualquier otro popover abierto para mantener la limpieza visual
            document.querySelectorAll('.description-popover.active').forEach(p => {
                if (p !== popover) p.classList.remove('active');
            });

            popover?.classList.toggle('active');
            return; // Detenemos el flujo para evitar cierres accidentales
        }

        // 2. Cierre Inteligente y Reset de Tarjetas (Evita el estado congelado)
        if (!e.target.closest('.description-popover') && !e.target.closest('.roadmap-link')) {
            const activePopovers = document.querySelectorAll('.description-popover.active');
            
            if (activePopovers.length > 0) {
                // Cerramos popovers
                activePopovers.forEach(p => p.classList.remove('active'));

                // RESET QUIRÚRGICO: Al cerrar el roadmap, liberamos las tarjetas del estado "congelado"
                document.querySelectorAll('.card-lobby-item').forEach(c => {
                    const body = c.querySelector('.card-body-app');
                    const footer = c.querySelector('.card-footer-app');
                    
                    c.classList.remove('card-active', 'card-expanded', 'card-inactive');
                    if (body) body.classList.remove('card-content-visible');
                    if (footer) footer.classList.remove('card-content-visible');
                });
            }
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
            
            // Reiniciamos el registro maestro con los productos existentes en Firestore
            const firestoreCourses = [];
            querySnapshot.forEach((doc) => {
                firestoreCourses.push({ id: doc.id, ...doc.data() });
            });

            // ROADMAP DREAMS: Sincronización de Inventario (Productos en Desarrollo según GEMINI_READY.md)
            const roadmapItems = [
                { id: 'DC-CAP-03', title: 'El valor real del propósito de mi empresa', category: 'Dirección', description: 'Descubre la brújula estratégica que garantiza la trascendencia de tu organización.', modality: 'ONLINE', isComingSoon: true, accentColor: '#957C3D' },
                { id: 'DC-CAP-04', title: 'Estrategia de diferenciación', category: 'Comercial', description: 'Domina tu mercado y deja de competir por precio mediante una propuesta de valor única.', modality: 'ONLINE', isComingSoon: true, accentColor: '#957C3D' },
                { id: 'DC-CAP-05', title: 'Mejorando los resultados', category: 'Productividad', description: 'Cómo medir y lograr tus metas de negocio con indicadores de alto impacto.', modality: 'ONLINE', isComingSoon: true, accentColor: '#957C3D' },
                { id: 'DC-CAP-06', title: 'Recupera tu tiempo', category: 'Productividad', description: 'Estabiliza tu operación y libera tu agenda para liderar con visión.', modality: 'ONLINE', isComingSoon: true, accentColor: '#957C3D' },
                { id: 'DC-CAP-07', title: 'Resultados garantizados', category: 'Liderazgo', description: 'Domina los indicadores que realmente mueven la aguja de tu negocio.', modality: 'ONLINE', isComingSoon: true, accentColor: '#957C3D' }
            ];

            const rawCourses = [...firestoreCourses, ...roadmapItems];

            // FASE 5: Handshake Dinámico de Cliente (Vigencia + ID + Modalidad)
            const user = auth.currentUser;
            let userServicios = {};
            
            if (user) {
                const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                userServicios = userDoc.data()?.expediente?.servicios || {};
            }

            COURSES_CONFIG = rawCourses.map(course => {
                const svcRecord = userServicios[course.id];
                const hoy = new Date();
                const fechaVenc = svcRecord ? new Date(svcRecord.fechaVencimiento) : null;
                
                // VALIDACIÓN SAAS: ¿El servicio está activo y dentro de la fecha de vigencia?
                const isExpired = fechaVenc ? fechaVenc < hoy : true;
                const hasValidAccess = svcRecord && svcRecord.status === 'activo' && !isExpired;
                
                return { 
                    ...course, 
                    // Un curso es accesible si el cliente lo compró (y está vigente) o si es gratuito
                    hasAccess: hasValidAccess || course.esGratis === true,
                    // TRACEABILIDAD: Priorizamos la modalidad asignada en el expediente sobre la del catálogo
                    modality: svcRecord?.modality || course.modality || 'ONLINE'
                };
            });

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
        const learningArea = document.getElementById('learning-content-area');
        if (!el) return;

        // Determinamos si el objetivo es MOSTRAR (isOpening)
        const isOpening = forceState !== null ? forceState : el.classList.contains('podcast-hidden');
        
        if (isOpening) {
            // 1. EXCLUSIVIDAD: Cerramos otras burbujas activas para evitar que se amontonen
            ['podcast-player', 'video-tutorial'].forEach(id => {
                if (id !== elementId) document.getElementById(id)?.classList.add('podcast-hidden');
            });

            // 2. ACTIVACIÓN Y DESENFOQUE: Mostramos recurso y desenfocamos el fondo (Fase Cinema)
            el.classList.remove('podcast-hidden');
            if (learningArea) {
                learningArea.style.filter = 'blur(10px) brightness(0.9)';
                learningArea.style.transition = 'filter 0.4s ease';
                learningArea.style.pointerEvents = 'none'; // Evita clics en el fondo mientras la burbuja está activa
            }
            
            if (elementId === 'video-tutorial') {
                const video = document.getElementById('tutorial-video');
                if (video && window.getComputedStyle(video).display !== 'none') {
                    video.play().catch(() => {});
                    video.volume = 0.4;
                }
            }
        } else {
            // 3. CIERRE Y NITIDEZ: Ocultamos recurso y restauramos la visibilidad del fondo
            el.classList.add('podcast-hidden');
            if (learningArea) {
                learningArea.style.filter = 'none';
                learningArea.style.pointerEvents = 'auto';
            }
            if (elementId === 'video-tutorial') document.getElementById('tutorial-video')?.pause();
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

    // Trazabilidad: Lógica de Propósito Universal removida.

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
            // Trazabilidad: Acción 'purpose' eliminada por definición de producto.
            else if (action === 'buy') {
                const course = COURSES_CONFIG.find(c => c.id === id);
                const user = auth.currentUser;

                // 1. DISPARO DE NOTIFICACIÓN INMEDIATA (Prestige Sales Engine)
                // Si el usuario está logueado, detonamos el Carrito de Compra a su correo en tiempo real.
                if (user) {
                    fetch('/.netlify/functions/intervencion-notificacion', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            destinatario: user.email,
                            cliente: { 
                            nombre: user.displayName || 'Líder Dreams', 
                            email: user.email,
                            uid: user.uid // Inyección crítica para Trazabilidad en Firestore
                        },
                            servicio: { titulo: course?.title || 'Programa Estratégico', id: id },
                            tipo: 'CARRITO_COMPRA',
                            omitirRegistroFirestore: false // Creamos el registro en la bandeja de intervenciones
                        })
                    }).then(() => console.log(`🚀 Carrito enviado a ${user.email}`))
                      .catch(err => console.error("🚨 Fallo en despacho automático:", err));
                }

                // 2. INTERFAZ: Activación de la pasarela visual (Dinamizada con Precio Firestore)
                window.dispatchEvent(new CustomEvent('OPEN_SHOPPING_CART', { 
                    detail: { 
                        courseId: id,
                        courseTitle: course?.title || 'Programa de Crecimiento',
                        coursePrice: course?.price || 0 // Trazabilidad de Inversión
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

        // Buscamos la coincidencia exacta del ID
        const courseConfig = COURSES_CONFIG.find(c => c.id === courseId);
        
        if (!courseConfig) {
            console.error("🚨 Dreams Security: Intento de acceso a curso inexistente.");
            return;
        }

        // --- SENTINEL DE SEGURIDAD (FASE 5.3) ---
        // Validación de "Último Segundo": Bloquea el acceso si la vigencia expiró 
        // o si se intenta vulnerar un curso de pago sin permiso activo.
        if (!courseConfig.hasAccess && !courseConfig.esGratis) {
            alert("🔒 ACCESO RESTRINGIDO:\nTu licencia para este programa ha expirado o no se encuentra activa.\n\nPor favor, contacta a tu consultor para renovar tu suscripción.");
            console.warn(`🚫 Sentinel: Acceso denegado para el curso [${courseId}]`);
            return;
        }

        if (!courseConfig.jsonPath) {
            console.error("🚨 Dreams Security: Ruta de contenido no definida.");
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
            const sessionSelector = document.getElementById('view-session-selector');
            if (sessionSelector) {
                sessionSelector.style.display = 'block';

                // SINCRONIZACIÓN DE HEADER AURA: Título del Programa
                const headerTitle = document.getElementById('header-aura-title');
                if (headerTitle) {
                    headerTitle.innerText = courseConfig.title.toUpperCase();
                }

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

        // --- MOTOR DE ENTRADA ESCALONADA (SESIONES PRESTIGE) ---
        setTimeout(() => {
            const sessionCards = sessionList.querySelectorAll('.card');
            sessionCards.forEach((card, i) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = `all 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${i * 0.15}s`;
                
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            });
        }, 50);
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

                // 4. Propósito Dinámico: Funcionalidad removida para optimizar el flujo de carga.
            }

            // --- RECONEXIÓN MULTIMEDIA ---
            if (currentSessionData.multimedia) {
                const podcastPlayer = document.getElementById('podcast-player');
                const selector = document.getElementById('podcast-selector');
                const podcastSource = document.getElementById('podcast-source');
                const audioElement = document.getElementById('audio-element');
                const videoElement = document.getElementById('tutorial-video');

                // Sincronización Silenciosa: Preparamos los recursos sin forzar su despliegue visual
                if (audioElement) {
                    audioElement.volume = 0.3;
                    audioElement.pause(); // Seguridad: Evita que el audio inicie sin interacción
                }

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
    const { courseId, courseTitle, coursePrice } = e.detail;
    const overlay = document.getElementById('cart-overlay');
    const titleEl = document.getElementById('cart-course-title');
    const priceEl = document.getElementById('cart-course-price'); // Nueva vinculación
    const btnPay = document.getElementById('btn-proceed-to-payment');

    if (overlay && titleEl) {
        titleEl.innerText = courseTitle;
        if (priceEl) priceEl.innerText = `$${coursePrice.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN`;
        
        overlay.style.display = 'flex';
        overlay.classList.add('active');

        // Vinculación Quirúrgica: Evitamos múltiples listeners al abrir/cerrar el carrito
        btnPay.onclick = async (e) => {
            e.preventDefault();
            console.log(`🚀 Dreams Sales: Iniciando protocolo de pago para ${courseId}`);
            await ejecutarProcesoDePago(courseId);
        };
    }
});

async function ejecutarProcesoDePago(courseId) {
    const user = auth.currentUser;
    if (!user) {
        alert("Por favor, inicia sesión para continuar con la compra.");
        return;
    }

    const btnPay = document.getElementById('btn-proceed-to-payment');
    const originalText = btnPay.innerText;
    
    try {
        btnPay.disabled = true;
        btnPay.innerText = "⏳ GENERANDO LINK DE PAGO...";

        // LLAMADA AL PROXY SEGURO (Punto 2 del Roadmap)
        const response = await fetch('/.netlify/functions/create-xpertpay-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseId: courseId,
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0] || 'Líder Dreams'
            })
        });

        const data = await response.json();

        if (data.url) {
            console.log("🚀 Redirigiendo a XpertPay...");
            window.location.href = data.url; // Redirección determinística a la pasarela
        } else {
            throw new Error(data.error || "No se pudo generar el link de pago.");
        }

    } catch (error) {
        console.error("🚨 Error en Checkout:", error);
        alert("Hubo un problema al conectar con la pasarela. Intenta de nuevo.");
        btnPay.disabled = false;
        btnPay.innerText = originalText;
    }
}

document.getElementById('btn-close-cart')?.addEventListener('click', () => {
    const overlay = document.getElementById('cart-overlay');
    if(overlay) {
        overlay.style.display = 'none';
        overlay.classList.remove('active');
    }
});
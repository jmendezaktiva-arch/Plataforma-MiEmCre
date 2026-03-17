//public/admin/admin-controller.js
// TRACEABILIDAD: Conexión con el Núcleo del Sistema (src/shared)
// Nota: Se omite la importación de UserManager ya que su lógica reside al final de este archivo.
// TRACEABILIDAD: Conexión unificada con el Ecosistema "Dreams Platform" (src/shared)
// TRACEABILIDAD: Importación de Instancia Principal (auth) y Monitor de Sesión (onAuthStateChanged)
import { db, auth, secondaryAuth } from '../../src/shared/firebase-config.js';
import { 
    doc, setDoc, updateDoc, getDoc, deleteDoc, serverTimestamp, 
    collection, getDocs, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    onAuthStateChanged, createUserWithEmailAndPassword, signOut,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// TRACEABILIDAD: Motor de Inteligencia de Negocio (BI) - Versión Real
const MetricsEngine = {
    async getGlobalAnalytics() {
        try {
            const usersRef = collection(db, "usuarios");
            const snapshot = await getDocs(usersRef);
            const users = snapshot.docs.map(doc => doc.data());

            // 1. Cálculo de App más Popular
            const appsCount = {};
            users.forEach(u => {
                (u.accesos?.apps || []).forEach(app => {
                    appsCount[app] = (appsCount[app] || 0) + 1;
                });
            });
            const popularApp = Object.keys(appsCount).reduce((a, b) => appsCount[a] > appsCount[b] ? a : b, "Ninguna");

            // 2. Cálculo de Punto de Equilibrio Promedio (Trazabilidad con Expediente)
            // Nota: Se asume que el dato vive en u.expediente.finanzas.puntoEquilibrio
            let sumaEquilibrio = 0;
            let clientesConDato = 0;
            users.forEach(u => {
                const pe = u.expediente?.finanzas?.puntoEquilibrio || 0;
                if (pe > 0) {
                    sumaEquilibrio += pe;
                    clientesConDato++;
                }
            });

            return {
                promedioPuntoEquilibrio: clientesConDato > 0 ? sumaEquilibrio / clientesConDato : 0,
                appMasPopular: popularApp.toUpperCase(),
                totalClientes: users.length
            };
        } catch (error) {
            console.error("🚨 Error en Motor de Métricas:", error);
            return { promedioPuntoEquilibrio: 0, appMasPopular: 'ERROR', totalClientes: 0 };
        }
    }
};

// --- MOTOR DE GESTIÓN DE IDENTIDAD (IAM) ---
// Se integra aquí para evitar errores 404 de importación y asegurar disponibilidad.
const UserManager = {
    async getAllUsers() {
        try {
            const usersRef = collection(db, "usuarios");
            const querySnapshot = await getDocs(usersRef);
            let users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            return users.sort((a, b) => {
                const dateA = a.fechaCreacion?.seconds || 0;
                const dateB = b.fechaCreacion?.seconds || 0;
                return dateB - dateA;
            });
        } catch (error) {
            console.error("🚨 Error al recuperar lista de usuarios:", error);
            throw error;
        }
    },

    async createUserProfile(uid, data) {
        try {
            const userRef = doc(db, "usuarios", uid);
            const profileData = {
                email: data.email,
                rol: data.rol.toLowerCase(),
                nombre: data.nombre || '',
                empresa: data.empresa || 'Dreams Platform',
                status: 'activo',
                requiereCambioPassword: true, // Trazabilidad: Forza al usuario a definir su clave en el primer acceso
                fechaCreacion: serverTimestamp(),
                accesos: {
                    cursos: data.cursos || [],
                    apps: data.apps || [],
                    consultor: data.consultor || []
                },
                expediente: {
                    diagnosticos: [],
                    ultimoAcceso: null,
                    progresoGeneral: 0
                }
            };
            await setDoc(userRef, profileData);
            console.log(`✅ Perfil de ${data.email} creado con éxito.`);
        } catch (error) {
            console.error("🚨 Error al crear perfil:", error);
            throw error;
        }
    },

    /**
     * updateAccess - Persistencia de cambios en permisos y roles
     */
    async updateAccess(uid, newAccess, newRol) {
        try {
            const userRef = doc(db, "usuarios", uid);
            await updateDoc(userRef, {
                "accesos": newAccess,
                "rol": newRol,
                "ultimaModificacion": serverTimestamp()
            });
            console.log(`✅ Documento ${uid} actualizado en Firestore.`);
        } catch (error) {
            console.error("🚨 Error en updateAccess:", error);
            throw error;
        }
    },

    /**
     * deleteUser - Eliminación física del perfil en Firestore
     * Trazabilidad: Remueve el expediente, pero el registro de Auth permanece en consola.
     */
    async deleteUser(uid) {
        try {
            const userRef = doc(db, "usuarios", uid);
            await deleteDoc(userRef);
            console.log(`🗑️ Expediente ${uid} eliminado correctamente.`);
        } catch (error) {
            console.error("🚨 Error en Motor de Borrado:", error);
            throw error;
        }
    }
};

/**
 * prepareEditUser - Función Global para el Motor de Edición
 * Se vincula a 'window' para que el botón de la tabla pueda ejecutarla.
 * Trazabilidad: Recupera el estado actual del cliente antes de abrir el modal.
 */
window.prepareEditUser = async (uid) => {
    try {
        const userRef = doc(db, "usuarios", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            renderEditModal(uid, userSnap.data());
        } else {
            alert("🚨 Error: No se encontró el expediente del usuario.");
        }
    } catch (error) {
        console.error("🚨 Error al preparar edición:", error);
    }
};

/**
 * renderEditModal - Interfaz de Gestión de Permisos (UI Prestige)
 * Construye dinámicamente el formulario con los accesos actuales del cliente.
 */
const renderEditModal = (uid, user) => {
    // Limpieza de instancias previas para evitar duplicidad
    document.getElementById('modal-edit-container')?.remove();

    const modalHtml = `
        <div id="modal-edit-container" style="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 52, 96, 0.8); z-index:9999; align-items:center; justify-content:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:450px; padding:30px; border-radius:12px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border-top: 6px solid var(--accent-gold);">
                <h3 style="margin-top:0; color:var(--primary-midnight); font-weight:900;">GESTIÓN DE ACCESOS</h3>
                <p style="font-size:0.85rem; color:#666; margin-bottom:20px;">Cliente: <strong>${user.nombre}</strong></p>
                
                <form id="form-edit-usuario">
                    <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:5px;">ROL DEL PERFIL</label>
                    <select id="edit-rol" style="width:100%; padding:10px; margin-bottom:20px; border:1px solid #ddd; border-radius:4px;">
                        <option value="cliente" ${user.rol === 'cliente' ? 'selected' : ''}>Cliente Estándar</option>
                        <option value="capacitador" ${user.rol === 'capacitador' ? 'selected' : ''}>Capacitador</option>
                        <option value="consultor" ${user.rol === 'consultor' ? 'selected' : ''}>Consultor</option>
                        <option value="admin" ${user.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>

                    <div style="margin-bottom:20px;">
                        <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:10px;">CURSOS EN ACADEMIA</label>
                        <label style="display:block; margin-bottom:8px; font-size:0.9rem;"><input type="checkbox" value="academia-a" ${(user.accesos?.cursos || []).includes('academia-a') ? 'checked' : ''}> Sesión A: Cimientos</label>
                        <label style="display:block; margin-bottom:8px; font-size:0.9rem;"><input type="checkbox" value="academia-b" ${(user.accesos?.cursos || []).includes('academia-b') ? 'checked' : ''}> Sesión B: Expansión</label>
                        <label style="display:block; margin-bottom:8px; font-size:0.9rem;"><input type="checkbox" value="academia-c" ${(user.accesos?.cursos || []).includes('academia-c') ? 'checked' : ''}> Sesión C: Maestría</label>
                    </div>

                    <div style="margin-bottom:25px; padding:10px; background:#f9f5eb; border-radius:6px;">
                        <label style="font-weight:700; font-size:0.8rem; color:var(--accent-gold);"><input type="checkbox" id="edit-ia" ${(user.accesos?.consultor || []).includes('ia-expert') ? 'checked' : ''}> ACTIVAR CONSULTOR IA</label>
                    </div>

                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button type="button" onclick="document.getElementById('modal-edit-container').remove()" style="background:none; border:none; color:#999; cursor:pointer; font-weight:600;">CANCELAR</button>
                        <button type="submit" style="background:var(--primary-midnight); color:white; border:none; padding:12px 20px; border-radius:6px; cursor:pointer; font-weight:700; font-size:0.8rem;">ACTUALIZAR PERMISOS</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Vinculación al motor de persistencia
    document.getElementById('form-edit-usuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSave = e.target.querySelector('button[type="submit"]');
        btnSave.disabled = true;
        btnSave.innerText = "GUARDANDO...";

        // Captura de nuevos estados
        const selectedCursos = Array.from(e.target.querySelectorAll('input[value^="academia-"]:checked')).map(el => el.value);
        const hasIA = e.target.querySelector('#edit-ia').checked;
        const newRol = document.getElementById('edit-rol').value;

        const newAccess = {
            cursos: selectedCursos,
            apps: user.accesos?.apps || [], // Preservamos apps existentes
            consultor: hasIA ? ['ia-expert'] : []
        };

        try {
            await UserManager.updateAccess(uid, newAccess, newRol);
            
            alert("✅ Accesos actualizados con éxito.");
            document.getElementById('modal-edit-container').remove();
            
            // Refresco de tabla y métricas para reflejar cambios
            loadUsersList();
            loadAdminStats(); 
        } catch (error) {
            alert("🚨 Error al guardar cambios. Revisa la consola.");
        } finally {
            btnSave.disabled = false;
            btnSave.innerText = "ACTUALIZAR PERMISOS";
        }
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    // --- GUARDIA DE SEGURIDAD (ADMIN GUARD) ---
    // Trazabilidad: Valida identidad y rol antes de activar el motor del dashboard.
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.warn("🔐 Acceso denegado: Redirigiendo a Login.");
            window.location.href = '../index.html'; // O tu ruta de acceso
            return;
        }

        try {
            const userRef = doc(db, "usuarios", user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data() || {};
            
            // TRACEABILIDAD: Normalización de Rol Resiliente (v2.0)
            // Permite variantes como 'Admin', 'admin' o 'Administrador'
            const userRol = (userData.rol || "").toLowerCase();
            const isAdmin = userRol === 'admin' || userRol === 'administrador';

            if (!userSnap.exists() || !isAdmin) {
                console.error("🚫 Acceso restringido: Rol insuficiente.", userRol);
                alert("Acceso restringido. Se requieren permisos de administrador.");
                window.location.href = '../index.html';
                return;
            }

            console.log("✅ Acceso concedido: Nivel Administrador verificado.");
            
            // TRACEABILIDAD: Disparo unificado de motores de datos
            // Ahora incluimos la carga del catálogo existente en Firestore
            loadAdminStats();
            loadUsersList();
            if (typeof loadCoursesList === 'function') {
                loadCoursesList(); 
            }
        } catch (error) {
            console.error("🚨 Error en el Guardia de Seguridad:", error);
            window.location.href = '../index.html';
        }
    });

    // Única declaración de elementos del DOM (Evita error 2451)
    const modalAlta = document.getElementById('modal-alta');
    const btnOpenAlta = document.getElementById('btn-open-alta');
    const formAlta = document.getElementById('form-alta-usuario');
    const searchInput = document.getElementById('search-input'); // Vinculado al input de tu HTML
    
    let allUsersCache = []; // Trazabilidad: Almacena los datos para búsqueda instantánea
    
    // --- MOTOR DE MÉTRICAS (BI) ---
    const loadAdminStats = async () => {
        try {
            const stats = await MetricsEngine.getGlobalAnalytics();
            
            const elBreakEven = document.getElementById('stat-break-even');
            const elPopular = document.getElementById('stat-popular-app');
            const elParticipation = document.getElementById('stat-participation');
            const barParticipation = document.getElementById('bar-participation');

            if (elBreakEven) elBreakEven.innerText = `$${stats.promedioPuntoEquilibrio.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
            if (elPopular) elPopular.innerText = stats.appMasPopular;
            if (elParticipation) {
                const percent = Math.round((stats.totalClientes / 100) * 100);
                elParticipation.innerText = `${percent}%`;
                if (barParticipation) barParticipation.style.width = `${percent}%`;
            }
        } catch (error) {
            console.error("🚨 Error al cargar analíticas:", error);
        }
    };

    /**
     * MOTOR DE RENDERIZADO DE TABLA (User Analytics)
     * Recupera y despliega la lista de clientes con sus accesos activos.
     */
    const loadUsersList = async (searchTerm = '') => {
        const tableBody = document.getElementById('table-users-body');
        const userCountEl = document.getElementById('user-count');
        
        try {
            // Trazabilidad: Solo descargamos de la nube si la caché está vacía
            if (allUsersCache.length === 0) {
                allUsersCache = await UserManager.getAllUsers();
            }
            
            // Filtro Quirúrgico: Compara el término con nombre o email
            const filteredUsers = allUsersCache.filter(user => 
                (user.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (userCountEl) userCountEl.innerText = `${allUsersCache.length} CLIENTES EN SISTEMA`;

            if (filteredUsers.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" style="padding:20px; text-align:center;">No hay clientes registrados aún.</td></tr>`;
                return;
            }

            tableBody.innerHTML = filteredUsers.map(user => {
                const totalCursos = user.accesos?.cursos?.length || 0;
                const totalApps = user.accesos?.apps?.length || 0;
                const tieneIA = user.accesos?.consultor?.length > 0 ? '✓ IA' : '';

                return `
                <tr style="border-bottom: 1px solid #f4f4f4; transition: background 0.2s;" onmouseover="this.style.background='#fafafa'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 15px;">
                        <div style="font-weight: 600; color: var(--primary-midnight);">${user.nombre}</div>
                        <div style="font-size: 0.7rem; color: var(--accent-gold); font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">${user.empresa || 'Empresa No Definida'}</div>
                        <div style="font-size: 0.75rem; color: #999;">${user.email}</div>
                    </td>
                    <td style="padding: 15px;">
                        <span style="background: #eee; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; text-transform: uppercase;">${user.rol}</span>
                    </td>
                    <td style="padding: 15px;">
                        <div style="font-size: 0.75rem;">
                            <strong>${totalCursos}</strong> Cursos | <strong>${totalApps}</strong> Apps <span style="color: var(--accent-gold); font-weight: 700;">${tieneIA}</span>
                        </div>
                    </td>
                    <td style="padding: 15px; text-align: right;">
                        <button class="btn-action" onclick="prepareEditUser('${user.id}')" style="background: none; border: none; cursor: pointer; margin-right: 10px;" title="Editar Accesos">⚙️</button>
                        <button class="btn-action" onclick="confirmDeleteUser('${user.id}', '${user.nombre}')" style="background: none; border: none; cursor: pointer; color: #dc2626;" title="Eliminar Usuario">🗑️</button>
                    </td>
                </tr>
                `;
            }).join('');

        } catch (error) {
            console.error("🚨 Error al poblar tabla de usuarios:", error);
            tableBody.innerHTML = `<tr><td colspan="4" style="padding:20px; text-align:center; color:red;">Error al sincronizar datos.</td></tr>`;
        }
    };

    /**
     * confirmDeleteUser - Protocolo de Seguridad de Doble Paso
     * Se vincula a 'window' para ser llamado desde la tabla.
     * Trazabilidad: Ejecuta el borrado en Firestore y actualiza el dashboard.
     */
    window.confirmDeleteUser = async (uid, nombre) => {
        const confirmacion = confirm(`⚠️ ADVERTENCIA DE SEGURIDAD:\n¿Estás seguro de eliminar permanentemente a "${nombre}"?\n\nEsta acción borrará su expediente y accesos de la Dreams Platform de forma irreversible.`);
        
        if (confirmacion) {
            try {
                // Llamada al motor IAM
                await UserManager.deleteUser(uid);
                
                alert("🗑️ Expediente eliminado con éxito.");
                
                // Sincronización inmediata de la interfaz
                await loadUsersList();
                await loadAdminStats();
            } catch (error) {
                console.error("🚨 Error en el flujo de borrado:", error);
                alert("🚨 Error: No se pudo eliminar el usuario. Verifique su conexión o permisos.");
            }
        }
    };

    // Nota: El disparo de loadAdminStats() y loadUsersList() ahora es gestionado 
    // exclusivamente por el Guardia de Seguridad (Admin Guard) arriba.

    // 1. CONTROL DE APERTURA (MODAL)
    btnOpenAlta?.addEventListener('click', () => {
        modalAlta.style.display = 'block';
    });

    // 2. MOTOR DE CAPTURA Y REGISTRO
    formAlta?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerText = "CREANDO CUENTA...";

        const email = document.getElementById('new-email').value;
        const password = document.getElementById('new-password').value;

        try {
            // Creación vía Instancia Secundaria para no cerrar sesión de Jorge
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const uid = userCredential.user.uid;

            const selectedCursos = Array.from(e.target.querySelectorAll('input[value^="academia-"]:checked')).map(el => el.value);
            const hasConsultor = e.target.querySelector('input[value="consultor-ia"]:checked');

            const userData = {
                nombre: document.getElementById('new-nombre').value,
                email: email,
                empresa: document.getElementById('new-empresa').value, // Trazabilidad: Captura el valor del nuevo input
                rol: document.getElementById('new-rol').value,
                cursos: selectedCursos,
                consultor: hasConsultor ? ['ia-expert'] : [],
                apps: []
            };

            // TRACEABILIDAD: Registro en Firestore, Disparo de Correo y Limpieza
            await UserManager.createUserProfile(uid, userData);
            
            // MOTOR DE COMUNICACIÓN: Se envía el link para que el usuario defina su clave real
            // Se utiliza la instancia secundaria para no interferir con la sesión del admin
            await sendPasswordResetEmail(secondaryAuth, email);
            console.log(`✉️ Correo de configuración de contraseña enviado a: ${email}`);
            
            await signOut(secondaryAuth);

            alert("✅ Cliente creado con éxito. El perfil se ha sincronizado con la colección 'usuarios'.");
            
            // Refresco quirúrgico de la tabla para ver al nuevo usuario de inmediato
            loadUsersList();
            modalAlta.style.display = 'none';
            formAlta.reset();
            
        } catch (error) {
            console.error("Error en Alta Prestige:", error);
            alert(`🚨 Error: ${error.message}`);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Crear y Asignar Permisos";
        }
    });

    // 3. MOTOR DE BÚSQUEDA EN TIEMPO REAL
    searchInput?.addEventListener('input', (e) => {
        loadUsersList(e.target.value);
    });

    // --- MOTOR DE GESTIÓN DE PROGRAMAS (CMS CORE) ---
    const CourseManager = {
        async saveCourse(data, courseId = null) {
            try {
                // Trazabilidad: Generamos un ID único si es curso nuevo, o usamos el existente
                const id = courseId || data.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                const courseRef = doc(db, "config_ecosistema", id);
                
                await setDoc(courseRef, {
                    ...data,
                    ultimaModificacion: serverTimestamp(),
                    orden: data.orden || 99 // Por defecto al final si no se define
                }, { merge: true });
                
                console.log(`✅ Dreams CMS: Programa [${id}] sincronizado.`);
            } catch (error) {
                console.error("🚨 Error en CourseManager.saveCourse:", error);
                throw error;
            }
        }
    };

    // --- ESCUCHADORES DEL MODAL DE CURSOS ---
    const btnOpenAltaCurso = document.getElementById('btn-open-alta-curso');
    const modalCurso = document.getElementById('modal-curso');
    const formCurso = document.getElementById('form-config-curso');

    btnOpenAltaCurso?.addEventListener('click', () => {
        formCurso.reset();
        formCurso.dataset.editingId = ""; // Limpiamos rastro de edición previa
        modalCurso.style.display = 'block';
    });

    formCurso?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerText = "SINCRONIZANDO...";

        // Captura de datos del Ecosistema
        const courseData = {
            title: document.getElementById('course-title').value,
            description: document.getElementById('course-description').value,
            purposeTitle: document.getElementById('course-purpose-title').value, // Inyección Propósito
            purposeDesc: document.getElementById('course-purpose-desc').value,   // Inyección Detalle
            category: document.getElementById('course-category').value,
            modality: document.getElementById('course-modality').value,
            esGratis: document.getElementById('course-is-free').checked,
            price: parseFloat(document.getElementById('course-price').value) || 0,
            hasVideo: document.getElementById('has-video').checked,
            hasPresentation: document.getElementById('has-presentation').checked,
            hasWorkbook: document.getElementById('has-workbook').checked,
            hasPodcast: document.getElementById('has-podcast').checked,
            zoomLink: document.getElementById('course-zoom-link').value,
            jsonPath: document.getElementById('course-json-path').value
        };

        try {
            const editingId = formCurso.dataset.editingId;
            await CourseManager.saveCourse(courseData, editingId);
            
            alert("✅ Programa guardado con éxito en Dreams Cloud.");
            modalCurso.style.display = 'none';
            
            // Aquí dispararemos el refresco de la tabla en el siguiente paso
            // Recarga quirúrgica del catálogo tras guardar
            loadCoursesList(); 
            
        } catch (error) {
            alert("🚨 Error al guardar el programa. Revisa la consola.");
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "GUARDAR CAMBIOS EN LA NUBE";
        }
    });

    /**
     * MOTOR DE RENDERIZADO DE CATÁLOGO (CMS UI)
     * Despliega los programas en tarjetas dinámicas con indicadores de materiales.
     */
    const loadCoursesList = async () => {
        const grid = document.getElementById('course-admin-grid');
        if (!grid) return;

        try {
            const q = query(collection(db, "config_ecosistema"), orderBy("orden", "asc"));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No hay programas configurados en el catálogo.</div>`;
                return;
            }

            grid.innerHTML = querySnapshot.docs.map(docSnap => {
                const c = docSnap.data();
                const id = docSnap.id;
                
                // Trazabilidad de Materiales: Generamos badges visuales
                const badges = `
                    <span style="opacity: ${c.hasVideo ? '1' : '0.2'}" title="Video">📺</span>
                    <span style="opacity: ${c.hasPresentation ? '1' : '0.2'}" title="Presentación">📽️</span>
                    <span style="opacity: ${c.hasWorkbook ? '1' : '0.2'}" title="Workbook">📝</span>
                    <span style="opacity: ${c.hasPodcast ? '1' : '0.2'}" title="Podcast">🎧</span>
                `;

                return `
                <article class="card" style="padding: 20px; border-top: 4px solid ${c.modality === 'LIVE' ? 'var(--brand-orange)' : 'var(--brand-blue)'};">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <span style="font-size: 0.6rem; font-weight: 800; text-transform: uppercase; color: #999;">${c.category}</span>
                        <div style="font-size: 1.1rem; filter: grayscale(${c.esGratis ? '0' : '1'});">${badges}</div>
                    </div>
                    <h4 style="margin: 0; font-size: 1rem; color: var(--primary-midnight);">${c.title}</h4>
                    <p style="font-size: 0.7rem; color: #666; margin: 10px 0; line-height: 1.4; min-height: 3em;">${c.description?.substring(0, 80)}...</p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                        <div>
                            <span style="font-size: 0.8rem; font-weight: 900; color: var(--primary-midnight);">${c.esGratis ? 'GRATIS' : '$' + c.price}</span>
                            <div style="font-size: 0.6rem; color: #999; text-transform: uppercase;">${c.modality}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="prepareEditCourse('${id}')" style="background: #f0f4f8; border: none; padding: 8px; border-radius: 6px; cursor: pointer;" title="Editar">⚙️</button>
                            <button onclick="confirmDeleteCourse('${id}', '${c.title}')" style="background: #fff0f0; border: none; padding: 8px; border-radius: 6px; cursor: pointer; color: #dc2626;" title="Eliminar">🗑️</button>
                        </div>
                    </div>
                </article>`;
            }).join('');

        } catch (error) {
            console.error("🚨 Error al cargar catálogo:", error);
        }
    };

    // --- FUNCIONES GLOBALES DE GESTIÓN (WINDOW HOOKS) ---

    window.prepareEditCourse = async (id) => {
        try {
            const docSnap = await getDoc(doc(db, "config_ecosistema", id));
            if (docSnap.exists()) {
                const c = docSnap.data();
                formCurso.dataset.editingId = id; // Guardamos el ID para el merge
                
                // Mapeo inverso: DB -> Formulario
                document.getElementById('course-title').value = c.title || '';
                document.getElementById('course-description').value = c.description || '';
                document.getElementById('course-purpose-title').value = c.purposeTitle || ''; // Carga Propósito
                document.getElementById('course-purpose-desc').value = c.purposeDesc || '';   // Carga Detalle
                document.getElementById('course-category').value = c.category || 'Generales';
                document.getElementById('course-modality').value = c.modality || 'ONLINE';
                document.getElementById('course-is-free').checked = c.esGratis || false;
                document.getElementById('course-price').value = c.price || 0;
                document.getElementById('has-video').checked = c.hasVideo !== false;
                document.getElementById('has-presentation').checked = c.hasPresentation !== false;
                document.getElementById('has-workbook').checked = c.hasWorkbook !== false;
                document.getElementById('has-podcast').checked = c.hasPodcast !== false;
                document.getElementById('course-zoom-link').value = c.zoomLink || '';
                document.getElementById('course-json-path').value = c.jsonPath || '';

                modalCurso.style.display = 'block';
            }
        } catch (error) {
            console.error("🚨 Error al editar:", error);
        }
    };

    window.confirmDeleteCourse = async (id, title) => {
        if (confirm(`⚠️ ¿Seguro que deseas eliminar el programa "${title}"?\nEsta acción es irreversible y afectará el acceso de los alumnos.`)) {
            try {
                await deleteDoc(doc(db, "config_ecosistema", id));
                loadCoursesList();
                alert("🗑️ Programa eliminado del catálogo.");
            } catch (error) {
                alert("🚨 No se pudo eliminar el curso.");
            }
        }
    };

    // --- MOTOR DE GESTIÓN DE CONSULTORÍA (CMS SERVICES) ---
    const ServiceManager = {
        async saveService(data, serviceId = null) {
            try {
                // Trazabilidad: Generamos un ID basado en el título o usamos el existente para edición
                const id = serviceId || data.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                const serviceRef = doc(db, "config_consultoria", id);
                
                await setDoc(serviceRef, {
                    ...data,
                    ultimaModificacion: serverTimestamp()
                }, { merge: true });
                
                console.log(`✅ Dreams Cloud: Servicio [${id}] sincronizado.`);
            } catch (error) {
                console.error("🚨 Error en ServiceManager.saveService:", error);
                throw error;
            }
        }
    };

    // ESCUCHADORES DEL MODAL DE SERVICIOS
    const btnOpenAltaServicio = document.getElementById('btn-open-alta-servicio');
    const modalServicio = document.getElementById('modal-servicio');
    const formServicio = document.getElementById('form-config-servicio');

    btnOpenAltaServicio?.addEventListener('click', () => {
        formServicio.reset();
        formServicio.dataset.editingId = ""; 
        modalServicio.style.display = 'block';
    });

    formServicio?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerText = "SINCRONIZANDO...";

        const serviceData = {
            title: document.getElementById('service-title').value,
            description: document.getElementById('service-description').value,
            purposeDesc: document.getElementById('service-purpose-desc').value,
            type: document.getElementById('service-type').value,
            price: parseFloat(document.getElementById('service-price').value) || 0,
            isActive: document.getElementById('service-is-active').checked,
            isHighlighted: document.getElementById('service-highlight').checked
        };

        try {
            const editingId = formServicio.dataset.editingId;
            await ServiceManager.saveService(serviceData, editingId);
            alert("✅ Servicio de Consultoría guardado con éxito.");
            modalServicio.style.display = 'none';
            loadServicesList(); // Refresco quirúrgico
        } catch (error) {
            alert("🚨 Error al guardar el servicio.");
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "SINCRONIZAR SERVICIO";
        }
    });

    /**
     * MOTOR DE RENDERIZADO DE SERVICIOS (ADMIN UI)
     */
    const loadServicesList = async () => {
        const grid = document.getElementById('service-admin-grid');
        if (!grid) return;

        try {
            const querySnapshot = await getDocs(collection(db, "config_consultoria"));
            
            if (querySnapshot.empty) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No hay servicios de consultoría configurados.</div>`;
                return;
            }

            grid.innerHTML = querySnapshot.docs.map(docSnap => {
                const s = docSnap.data();
                return `
                <article class="card" style="padding: 20px; border-top: 4px solid ${s.type === 'IA' ? 'var(--accent-gold)' : 'var(--primary-midnight)'};">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <span style="font-size: 0.6rem; font-weight: 800; text-transform: uppercase; color: #999;">${s.type}</span>
                        ${s.isActive ? '🟢' : '🔴'}
                    </div>
                    <h4 style="margin: 10px 0; font-size: 1rem; color: var(--primary-midnight);">${s.title}</h4>
                    <p style="font-size: 0.7rem; color: #666; line-height: 1.4; min-height: 3em;">${s.description?.substring(0, 80)}...</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                        <span style="font-size: 0.8rem; font-weight: 900;">$${s.price.toLocaleString()}</span>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="prepareEditService('${docSnap.id}')" style="background: #f0f4f8; border: none; padding: 8px; border-radius: 6px; cursor: pointer;">⚙️</button>
                        </div>
                    </div>
                </article>`;
            }).join('');
        } catch (error) {
            console.error("🚨 Error al cargar servicios:", error);
        }
    };

    window.prepareEditService = async (id) => {
        const docSnap = await getDoc(doc(db, "config_consultoria", id));
        if (docSnap.exists()) {
            const s = docSnap.data();
            formServicio.dataset.editingId = id;
            document.getElementById('service-title').value = s.title;
            document.getElementById('service-description').value = s.description;
            document.getElementById('service-purpose-desc').value = s.purposeDesc;
            document.getElementById('service-type').value = s.type;
            document.getElementById('service-price').value = s.price;
            document.getElementById('service-is-active').checked = s.isActive;
            document.getElementById('service-highlight').checked = s.isHighlighted;
            modalServicio.style.display = 'block';
        }
    };

    // Actualización del registro maestro de datos
    window.initAdminData = () => {
        loadAdminStats();
        loadUsersList();
        loadCoursesList();
        loadServicesList(); // Inclusión del pilar de consultoría
    };
});
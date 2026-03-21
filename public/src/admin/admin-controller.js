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

            // 3. Monitor de Expiración SaaS (Escaneo de Trazabilidad Temporal)
            // Identifica cuántos servicios requieren atención inmediata en todo el sistema.
            let vencidos = 0;
            let proximos = 0;

            users.forEach(u => {
                const servicios = u.expediente?.servicios || {};
                Object.values(servicios).forEach(svc => {
                    const evalRes = ExpirationEngine.evaluate(svc.fechaVencimiento);
                    if (evalRes.status === 'vencido') vencidos++;
                    if (evalRes.status === 'critico') proximos++;
                });
            });

            return {
                promedioPuntoEquilibrio: clientesConDato > 0 ? sumaEquilibrio / clientesConDato : 0,
                appMasPopular: popularApp.toUpperCase(),
                totalClientes: users.length,
                vencidos,
                proximos
            };
        } catch (error) {
            console.error("🚨 Error en Motor de Métricas:", error);
            return { promedioPuntoEquilibrio: 0, appMasPopular: 'ERROR', totalClientes: 0 };
        }
    }
};

// TRACEABILIDAD: Motor de Vigencia SaaS (Expiration Engine)
// Centraliza el cálculo de tiempos para garantizar que las alertas sean consistentes en todo el ecosistema.
const ExpirationEngine = {
    evaluate(fechaVencimientoISO) {
        if (!fechaVencimientoISO) return { dias: 999, status: 'inactivo', color: 'rgba(15, 52, 96, 0.2)' };
        
        const hoy = new Date();
        const venc = new Date(fechaVencimientoISO);
        const diferencia = venc - hoy;
        const diasRestantes = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) {
            return { dias: diasRestantes, status: 'vencido', color: '#dc2626' }; // Rojo: Bloqueo sugerido
        }
        if (diasRestantes <= 30) {
            return { dias: diasRestantes, status: 'critico', color: '#f59e0b' }; // Naranja: Alerta de renovación
        }
        return { dias: diasRestantes, status: 'vigente', color: '#16a34a' }; // Verde: Operación normal
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
            // TRACEABILIDAD: Inicialización del Expediente Maestro (CRM Core)
            const profileData = {
                email: data.email,
                rol: data.rol.toLowerCase(),
                nombre: data.nombre || '',
                empresa: data.empresa || 'Dreams Platform',
                status: 'activo',
                requiereCambioPassword: true, 
                fechaCreacion: serverTimestamp(),
                accesos: {
                    cursos: data.cursos || [],
                    apps: data.apps || [],
                    consultor: data.consultor || []
                },
                expediente: {
                    // Control de Vigencia Dinámico (SaaS Model)
                    servicios: {}, 
                    // Historial de Movimientos (Handshake Log)
                    trazabilidad: [{
                        fecha: new Date().toISOString(),
                        evento: "SISTEMA_ALTA",
                        descripcion: "Perfil creado y accesos iniciales asignados."
                    }],
                    // Inteligencia Financiera
                    finanzas: {
                        historialPagos: [],
                        saldoPendiente: 0,
                        totalInvertido: 0
                    },
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
    /**
     * updateAccess - Procesador de Expediente Maestro v2.0 (Super Poderes)
     * Gestiona accesos, vigencias, registros financieros y escalabilidad.
     */
    async updateAccess(uid, newAccess, newRol, extraData = {}) {
        try {
            const userRef = doc(db, "usuarios", uid);
            
            // 1. SINCRONIZACIÓN: Recuperamos estado actual
            const userSnap = await getDoc(userRef);
            const currentData = userSnap.data() || {};
            const currentExpediente = currentData.expediente || {};
            const currentFinanzas = currentExpediente.finanzas || { totalInvertido: 0, historialPagos: [] };

            const hoy = new Date();
            const vencimientoSaaS = new Date();
            vencimientoSaaS.setFullYear(hoy.getFullYear() + 1);

            // 2. CÁLCULO DE VIGENCIA
            const nuevosServicios = { ...(currentExpediente.servicios || {}) };
            const serviciosActivados = [...(newAccess.apps || []), ...(newAccess.consultor || [])];
            
            serviciosActivados.forEach(id => {
                if (!nuevosServicios[id]) {
                    nuevosServicios[id] = {
                        fechaActivacion: hoy.toISOString(),
                        fechaVencimiento: vencimientoSaaS.toISOString(),
                        status: 'activo'
                    };
                }
            });

            // 3. PROCESAMIENTO FINANCIERO Y ESCALABILIDAD
            let totalInvertido = currentFinanzas.totalInvertido || 0;
            const logTrazabilidad = [...(currentExpediente.trazabilidad || [])];

            // Si hay un pago nuevo, lo sumamos y generamos hito en el Dossier
            if (extraData.nuevoPago > 0) {
                totalInvertido += extraData.nuevoPago;
                logTrazabilidad.push({
                    fecha: hoy.toISOString(),
                    evento: "PAGO_REGISTRADO",
                    descripcion: `Ingreso manual de $${extraData.nuevoPago.toLocaleString()} asignado al expediente.`
                });
            }

            logTrazabilidad.push({
                fecha: hoy.toISOString(),
                evento: "ACTUALIZACION_SISTEMA",
                descripcion: `Modificación manual. Rol: ${newRol.toUpperCase()}. Cuota usuarios: ${extraData.cuotaUsuarios}.`
            });

            // 4. PERSISTENCIA ATÓMICA DEL EXPEDIENTE MAESTRO
            await updateDoc(userRef, {
                "accesos": newAccess,
                "rol": newRol,
                "ultimaModificacion": serverTimestamp(),
                "expediente.servicios": nuevosServicios,
                "expediente.usuariosAdicionales": parseInt(extraData.cuotaUsuarios) || 0,
                "expediente.finanzas.totalInvertido": totalInvertido,
                "expediente.trazabilidad": logTrazabilidad
            });
            
            console.log(`✅ Super Poderes aplicados al expediente de ${uid}.`);
        } catch (error) {
            console.error("🚨 Error en Procesador Maestro:", error);
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

                    <div style="margin-bottom:20px; padding-top: 10px; border-top: 1px solid #eee;">
                        <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:10px;">APLICACIONES (HERRAMIENTAS)</label>
                        <label style="display:block; margin-bottom:8px; font-size:0.9rem;"><input type="checkbox" value="app-crm" ${(user.accesos?.apps || []).includes('app-crm') ? 'checked' : ''}> CRM Ventas</label>
                        <label style="display:block; margin-bottom:8px; font-size:0.9rem;"><input type="checkbox" value="app-erp" ${(user.accesos?.apps || []).includes('app-erp') ? 'checked' : ''}> ERP Finanzas</label>
                        <label style="display:block; margin-bottom:8px; font-size:0.9rem;"><input type="checkbox" value="app-process" ${(user.accesos?.apps || []).includes('app-process') ? 'checked' : ''}> Process Designer</label>
                    </div>

                    <div style="margin-bottom:20px; padding:10px; background:#f9f5eb; border-radius:6px;">
                        <label style="font-weight:700; font-size:0.8rem; color:var(--accent-gold);"><input type="checkbox" id="edit-ia" ${(user.accesos?.consultor || []).includes('ia-expert') ? 'checked' : ''}> ACTIVAR CONSULTOR IA</label>
                    </div>

                    <div style="margin-bottom:25px; padding-top: 15px; border-top: 1px solid #eee;">
                        <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:12px; color:var(--primary-midnight);">FINANZAS Y ESCALABILIDAD</label>
                        <div style="display:flex; gap:12px;">
                            <div style="flex:1;">
                                <label style="display:block; font-size:0.65rem; color:#999; margin-bottom:5px;">REGISTRAR NUEVO PAGO ($)</label>
                                <input type="number" id="edit-pago" placeholder="0.00" step="0.01" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; font-size:0.85rem;">
                            </div>
                            <div style="flex:1;">
                                <label style="display:block; font-size:0.65rem; color:#999; margin-bottom:5px;">CUOTA USUARIOS EXTRA</label>
                                <input type="number" id="edit-cuota" value="${user.expediente?.usuariosAdicionales || 0}" min="0" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; font-size:0.85rem;">
                            </div>
                        </div>
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

        // TRACEABILIDAD: Captura segmentada de nuevos estados para actualización de perfil
        const selectedCursos = Array.from(e.target.querySelectorAll('input[value^="academia-"]:checked')).map(el => el.value);
        const selectedApps = Array.from(e.target.querySelectorAll('input[value^="app-"]:checked')).map(el => el.value);
        const hasIA = e.target.querySelector('#edit-ia').checked;
        const newRol = document.getElementById('edit-rol').value;

        const newAccess = {
            cursos: selectedCursos,
            apps: selectedApps, // Trazabilidad: Sincronización real de herramientas autorizadas
            consultor: hasIA ? ['ia-expert'] : []
        };

        const extraData = {
            nuevoPago: parseFloat(document.getElementById('edit-pago').value) || 0,
            cuotaUsuarios: parseInt(document.getElementById('edit-cuota').value) || 0
        };

        try {
            await UserManager.updateAccess(uid, newAccess, newRol, extraData);
            
            alert("✅ Expediente Maestro actualizado con éxito.");
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
            // TRACEABILIDAD: Orquestación Unificada de Datos (Master Boot)
            // Ejecuta en un solo pulso la carga de BI, Usuarios, Catálogos y Leads.
            if (typeof window.initAdminData === 'function') {
                window.initAdminData();
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
    
    // --- MOTOR DE MÉTRICAS (BI) + MONITOR DE ALERTAS ---
    const loadAdminStats = async () => {
        try {
            const stats = await MetricsEngine.getGlobalAnalytics();
            
            // 1. Renderizado de Métricas Estándar
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

            // 2. TRACEABILIDAD VISUAL: Inyección de Alertas SaaS Prestige
            // Si existen servicios vencidos o por vencer, inyectamos una cinta de aviso proactivo.
            const alertContainer = document.getElementById('saas-alerts-container');
            if (alertContainer) {
                if (stats.vencidos > 0 || stats.proximos > 0) {
                    alertContainer.style.display = 'block';
                    alertContainer.innerHTML = `
                        <div style="background: ${stats.vencidos > 0 ? '#fee2e2' : '#fef3c7'}; color: ${stats.vencidos > 0 ? '#991b1b' : '#92400e'}; padding: 15px 25px; border-radius: 16px; margin-bottom: 30px; display: flex; align-items: center; gap: 20px; border: 1px solid ${stats.vencidos > 0 ? '#fecaca' : '#fde68a'}; animation: fadeIn 0.6s ease-out; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            <span style="font-size: 1.5rem;">${stats.vencidos > 0 ? '🛑' : '⏳'}</span>
                            <div style="flex: 1;">
                                <h5 style="margin: 0; font-size: 0.9rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Estado de Vigencia SaaS</h5>
                                <p style="margin: 3px 0 0 0; font-size: 0.8rem; font-weight: 400; opacity: 0.9;">
                                    Se detectaron <strong style="text-decoration:underline;">${stats.vencidos} servicios vencidos</strong> y <strong>${stats.proximos} alertas críticas</strong> de renovación.
                                </p>
                            </div>
                            <button onclick="document.getElementById('search-input').focus();" style="background: rgba(255,255,255,0.5); border: none; padding: 8px 15px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; cursor: pointer; color: inherit; transition: 0.3s;">GESTIONAR AHORA</button>
                        </div>
                    `;
                } else {
                    alertContainer.style.display = 'none';
                    alertContainer.innerHTML = '';
                }
            }
        } catch (error) {
            console.error("🚨 Error al cargar analíticas y alertas:", error);
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
                const servicios = user.expediente?.servicios || {};
                
                // TRACEABILIDAD: Evaluación de Vigencia vía ExpirationEngine
                // Delegamos la inteligencia de colores al motor central para mantener consistencia.
                const getStatusColor = (id) => {
                    const svc = servicios[id];
                    const analysis = ExpirationEngine.evaluate(svc?.fechaVencimiento);
                    return analysis.color;
                };

                const tieneIA = (user.accesos?.consultor || []).includes('ia-expert');

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
                        <div style="font-size: 0.75rem; display: flex; align-items: center; gap: 12px;">
                            <span title="Cursos en Academia">📚 <strong>${totalCursos}</strong></span>
                            |
                            <div style="display: flex; gap: 6px;">
                                ${(user.accesos?.apps || []).map(app => 
                                    `<span style="color: ${getStatusColor(app)}; cursor: help; font-size: 1.1rem;" title="App: ${app}">📱</span>`
                                ).join('')}
                                ${tieneIA ? `<span style="color: ${getStatusColor('ia-expert')}; cursor: help; font-size: 1.1rem;" title="Consultor IA Expert">✨</span>` : ''}
                            </div>
                        </div>
                    </td>
                    <td style="padding: 15px; text-align: right;">
                        <button class="btn-action" onclick="window.viewUserLogs('${user.id}', '${user.nombre}')" style="background: none; border: none; cursor: pointer; margin-right: 12px; font-size: 1.2rem;" title="Ver Expediente de Trazabilidad">📑</button>
                        <button class="btn-action" onclick="prepareEditUser('${user.id}')" style="background: none; border: none; cursor: pointer; margin-right: 12px;" title="Gestionar Accesos">⚙️</button>
                        <button class="btn-action" onclick="confirmDeleteUser('${user.id}', '${user.nombre}')" style="background: none; border: none; cursor: pointer; color: #dc2626;" title="Eliminar Cliente">🗑️</button>
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

    /**
     * viewUserLogs - Motor de Visualización del Expediente Maestro
     * Recupera y renderiza la línea de tiempo de trazabilidad del cliente.
     */
    window.viewUserLogs = async (uid, nombre) => {
        try {
            const userSnap = await getDoc(doc(db, "usuarios", uid));
            if (!userSnap.exists()) return alert("🚨 Error: No se encontró el expediente del usuario.");

            const data = userSnap.data();
            const trazabilidad = data.expediente?.trazabilidad || [];
            
            renderTimelineModal(nombre, trazabilidad);
        } catch (error) {
            console.error("🚨 Error al cargar trazabilidad:", error);
            alert("No se pudo abrir el dossier. Revisa la consola.");
        }
    };

    /**
     * renderTimelineModal - Interfaz "Dossier Dreams" (UI Prestige)
     * Construye un Timeline cronológico inverso (lo más reciente arriba).
     */
    const renderTimelineModal = (nombre, logs) => {
        document.getElementById('modal-logs-container')?.remove();

        const sortedLogs = [...logs].reverse(); // Prioridad a los hitos recientes

        const logsHtml = sortedLogs.map(log => `
            <div style="border-left: 3px solid var(--accent-gold); padding-left: 20px; margin-bottom: 25px; position: relative; animation: fadeIn 0.4s ease-out;">
                <div style="width: 12px; height: 12px; background: var(--accent-gold); border-radius: 50%; position: absolute; left: -8px; top: 4px; box-shadow: 0 0 10px rgba(149, 124, 61, 0.4);"></div>
                <div style="font-size: 0.7rem; color: #999; font-weight: 700; letter-spacing: 0.5px;">${new Date(log.fecha).toLocaleString('es-MX')}</div>
                <div style="font-size: 0.85rem; font-weight: 800; color: var(--primary-midnight); text-transform: uppercase; margin: 4px 0;">${log.evento.replace(/_/g, ' ')}</div>
                <div style="font-size: 0.9rem; color: #444; line-height: 1.5; font-weight: 400;">${log.descripcion}</div>
            </div>
        `).join('') || '<div style="text-align:center; padding:40px; color:#999; font-style:italic;">No existen registros históricos para este cliente.</div>';

        const modalHtml = `
            <div id="modal-logs-container" style="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 52, 96, 0.9); z-index:10001; align-items:center; justify-content:center; backdrop-filter: blur(10px);">
                <div style="background:#fff; width:550px; max-height: 85vh; border-radius:24px; box-shadow: 0 40px 100px rgba(0,0,0,0.5); display:flex; flex-direction:column; overflow:hidden; border: 1px solid rgba(255,255,255,0.2);">
                    <header style="background: var(--primary-midnight); padding: 30px; color: #fff; border-bottom: 5px solid var(--accent-gold);">
                        <h3 style="margin:0; font-size: 1.2rem; font-weight: 900; letter-spacing: 1.5px;">DOSSIER DE TRAZABILIDAD</h3>
                        <p style="margin: 8px 0 0 0; font-size: 0.8rem; color: var(--accent-gold); font-weight: 700; text-transform: uppercase;">Líder: ${nombre}</p>
                    </header>
                    
                    <div style="flex: 1; overflow-y: auto; padding: 40px; background: #fdfdfd;">
                        ${logsHtml}
                    </div>

                    <footer style="padding: 25px; border-top: 1px solid #eee; text-align: right; background: #fff;">
                        <button onclick="document.getElementById('modal-logs-container').remove()" 
                                style="background: var(--primary-midnight); color: white; border: 1px solid var(--accent-gold); padding: 14px 30px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 0.8rem; letter-spacing: 1px; transition: 0.3s;"
                                onmouseover="this.style.background='#164275'" onmouseout="this.style.background='var(--primary-midnight)'">
                            CERRAR EXPEDIENTE
                        </button>
                    </footer>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
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

            // TRACEABILIDAD: Captura segmentada de permisos (Academia, Apps, Consultoría)
            const selectedCursos = Array.from(e.target.querySelectorAll('input[value^="academia-"]:checked')).map(el => el.value);
            const selectedApps = Array.from(e.target.querySelectorAll('input[value^="app-"]:checked')).map(el => el.value);
            const hasConsultor = e.target.querySelector('input[value="consultor-ia"]:checked');

            const userData = {
                nombre: document.getElementById('new-nombre').value,
                email: email,
                empresa: document.getElementById('new-empresa').value,
                rol: document.getElementById('new-rol').value,
                cursos: selectedCursos,
                apps: selectedApps, // Trazabilidad: Inyección de herramientas digitales autorizadas
                consultor: hasConsultor ? ['ia-expert'] : []
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

    // --- MOTOR DE UI DINÁMICA: Fases y Actividades (Consultoría Prestige) ---
    const PhaseEngine = {
        // Generador de HTML para una Fase
        renderPhase(index) {
            return `
            <div class="phase-block" data-phase-index="${index}" style="background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 15px; position: relative; margin-bottom: 10px;">
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px;">
                    <span style="background: var(--primary-midnight); color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700;">${index + 1}</span>
                    <input type="text" placeholder="Nombre de la Fase (ej: Diagnóstico Inicial)" class="form-control phase-title" style="margin: 0; font-weight: 700; border-color: transparent; background: #f9f9f9; flex: 1;" required>
                    <button type="button" class="btn-remove-phase" style="background: none; border: none; color: #cc0000; cursor: pointer; font-size: 0.8rem; padding: 5px;" title="Eliminar Fase">✕</button>
                </div>
                
                <div class="activities-container" style="display: flex; flex-direction: column; gap: 8px; padding-left: 32px;">
                    </div>

                <button type="button" class="btn-add-activity" style="margin: 10px 0 0 32px; background: none; border: 1px dashed #ddd; color: #999; padding: 5px 12px; border-radius: 6px; font-size: 0.65rem; cursor: pointer; font-weight: 600; transition: 0.2s;">
                    + AGREGAR ACTIVIDAD
                </button>
            </div>`;
        },

        // Generador de HTML para una Actividad
        renderActivity() {
            return `
            <div class="activity-row" style="display: flex; gap: 10px; align-items: center;">
                <input type="text" placeholder="Nombre de la actividad..." class="form-control activity-title" style="flex: 3; font-size: 0.75rem; margin: 0; padding: 8px;" required>
                <div style="flex: 1; display: flex; align-items: center; gap: 5px;">
                    <input type="number" placeholder="0" class="form-control activity-duration" style="margin: 0; font-size: 0.75rem; text-align: center; padding: 8px;" min="0.5" step="0.5" required>
                    <span style="font-size: 0.6rem; color: #999; font-weight: 700;">HRS</span>
                </div>
                <button type="button" class="btn-remove-activity" style="background: none; border: none; color: #ccc; cursor: pointer; font-size: 0.7rem; padding: 5px;">✕</button>
            </div>`;
        },

        // Motor de Cálculo de Trazabilidad Temporal y Económica
        calculateTotals() {
            let grandTotal = 0;
            document.querySelectorAll('.activity-duration').forEach(input => {
                grandTotal += parseFloat(input.value) || 0;
            });
            
            // Capturamos el precio por hora definido por el administrador
            const hourlyRate = parseFloat(document.getElementById('service-price').value) || 0;
            const totalInvestment = grandTotal * hourlyRate;

            const display = document.getElementById('service-total-hours-display');
            const hiddenInput = document.getElementById('service-total-hours');
            const investmentDisplay = document.getElementById('service-total-investment-display');

            if (display) display.innerText = `${grandTotal} hrs`;
            if (hiddenInput) hiddenInput.value = grandTotal;
            
            // Inyectamos el cálculo económico en la UI con formato moneda
            if (investmentDisplay) {
                investmentDisplay.innerText = `$${totalInvestment.toLocaleString('es-MX', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                })}`;
            }
        }
    };

    // Inicialización del Modal de Servicios con Primera Fase
    btnOpenAltaServicio?.addEventListener('click', () => {
        formServicio.reset();
        formServicio.dataset.editingId = ""; 
        
        // Limpiar contenedor e inyectar Fase 1 + Actividad 1 por defecto
        const container = document.getElementById('phases-container');
        if (container) {
            container.innerHTML = PhaseEngine.renderPhase(0);
            container.querySelector('.activities-container').innerHTML = PhaseEngine.renderActivity();
            PhaseEngine.calculateTotals();
        }
        
        modalServicio.style.display = 'block';
    });

    // --- ESCUCHADORES DINÁMICOS PARA GESTIÓN DE FASES (DELEGACIÓN) ---
    
    // 1. Agregar nueva Fase
    document.getElementById('btn-add-phase')?.addEventListener('click', () => {
        const container = document.getElementById('phases-container');
        const nextIndex = container.querySelectorAll('.phase-block').length;
        
        container.insertAdjacentHTML('beforeend', PhaseEngine.renderPhase(nextIndex));
        // Inyectamos la primera actividad de la nueva fase automáticamente
        container.querySelector(`[data-phase-index="${nextIndex}"] .activities-container`).innerHTML = PhaseEngine.renderActivity();
        PhaseEngine.calculateTotals();
    });

    // 2. Control Maestro de Clics (Agregar Actividad / Eliminar elementos)
    document.getElementById('phases-container')?.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        // Lógica: Agregar Actividad
        if (target.classList.contains('btn-add-activity')) {
            target.closest('.phase-block').querySelector('.activities-container').insertAdjacentHTML('beforeend', PhaseEngine.renderActivity());
        }

        // Lógica: Eliminar Actividad (Integridad de Negocio: Mínimo 1)
        if (target.classList.contains('btn-remove-activity')) {
            const activities = target.closest('.activities-container').querySelectorAll('.activity-row');
            if (activities.length > 1) {
                target.closest('.activity-row').remove();
                PhaseEngine.calculateTotals();
            } else {
                alert("📍 Trazabilidad: Una fase no puede quedar huérfana. Debe tener al menos una actividad.");
            }
        }

        // Lógica: Eliminar Fase (Integridad de Negocio: Mínimo 1)
        if (target.classList.contains('btn-remove-phase')) {
            const phases = document.querySelectorAll('.phase-block');
            if (phases.length > 1) {
                target.closest('.phase-block').remove();
                PhaseEngine.calculateTotals();
            } else {
                alert("📍 Integridad: El servicio debe contar con al menos una fase de ejecución.");
            }
        }
    });

    // 3. Disparadores de Recálculo Automático (Trazabilidad Financiera)
    // Escucha cambios en las duraciones de las actividades (Fases)
    document.getElementById('phases-container')?.addEventListener('input', (e) => {
        if (e.target.classList.contains('activity-duration')) {
            PhaseEngine.calculateTotals();
        }
    });

    // Escucha cambios en el precio base (Tarifa por Hora)
    document.getElementById('service-price')?.addEventListener('input', () => {
        PhaseEngine.calculateTotals();
    });

    formServicio?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerText = "SINCRONIZANDO...";

        // TRACEABILIDAD: Mapeo de estructura compleja (Fases > Actividades)
        const phasesData = Array.from(document.querySelectorAll('.phase-block')).map(phaseEl => {
            return {
                title: phaseEl.querySelector('.phase-title').value,
                activities: Array.from(phaseEl.querySelectorAll('.activity-row')).map(actEl => {
                    return {
                        title: actEl.querySelector('.activity-title').value,
                        duration: parseFloat(actEl.querySelector('.activity-duration').value) || 0
                    };
                })
            };
        });

        const totalHours = parseFloat(document.getElementById('service-total-hours').value) || 0;
        const hourlyRate = parseFloat(document.getElementById('service-price').value) || 0;

        const serviceData = {
            title: document.getElementById('service-title').value,
            description: document.getElementById('service-description').value,
            purposeDesc: document.getElementById('service-purpose-desc').value,
            type: document.getElementById('service-type').value,
            // Trazabilidad Financiera: El precio público es el total calculado
            price: totalHours * hourlyRate, 
            hourlyRate: hourlyRate, // Guardamos la tarifa base para que sea editable después
            isActive: document.getElementById('service-is-active').checked,
            isHighlighted: document.getElementById('service-highlight').checked,
            
            // Inyección de parámetros de Consultoría
            totalHours: totalHours,
            phases: phasesData
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
        try {
            const docSnap = await getDoc(doc(db, "config_consultoria", id));
            if (docSnap.exists()) {
                const s = docSnap.data();
                formServicio.dataset.editingId = id;
                
                // 1. Mapeo de campos estándar
                document.getElementById('service-title').value = s.title || '';
                document.getElementById('service-description').value = s.description || '';
                document.getElementById('service-purpose-desc').value = s.purposeDesc || '';
                document.getElementById('service-type').value = s.type || 'Proyecto';
                // Trazabilidad: Cargamos la tarifa horaria base. 
                // Fallback: Si es un registro antiguo sin hourlyRate, usamos el price actual.
                document.getElementById('service-price').value = s.hourlyRate || s.price || 0;
                document.getElementById('service-is-active').checked = s.isActive !== false;
                document.getElementById('service-highlight').checked = s.isHighlighted || false;

                // 2. RECONSTRUCCIÓN DE FASES Y ACTIVIDADES (Mapeo Inverso)
                const container = document.getElementById('phases-container');
                container.innerHTML = ''; // Limpieza quirúrgica del contenedor

                if (s.phases && s.phases.length > 0) {
                    s.phases.forEach((phase, pIdx) => {
                        // Inyectamos el cascarón de la fase
                        container.insertAdjacentHTML('beforeend', PhaseEngine.renderPhase(pIdx));
                        const phaseBlock = container.querySelector(`[data-phase-index="${pIdx}"]`);
                        phaseBlock.querySelector('.phase-title').value = phase.title;

                        // Inyectamos y poblamos cada actividad de esta fase
                        const actContainer = phaseBlock.querySelector('.activities-container');
                        phase.activities.forEach(activity => {
                            actContainer.insertAdjacentHTML('beforeend', PhaseEngine.renderActivity());
                            const lastAct = actContainer.lastElementChild;
                            lastAct.querySelector('.activity-title').value = activity.title;
                            lastAct.querySelector('.activity-duration').value = activity.duration;
                        });
                    });
                } else {
                    // Si es un servicio antiguo sin fases, creamos la estructura base
                    container.innerHTML = PhaseEngine.renderPhase(0);
                    container.querySelector('.activities-container').innerHTML = PhaseEngine.renderActivity();
                }

                // 3. Sincronización de totales
                PhaseEngine.calculateTotals();
                modalServicio.style.display = 'block';
            }
        } catch (error) {
            console.error("🚨 Error al reconstruir servicio para edición:", error);
            alert("No se pudo cargar la estructura del servicio. Revisa la consola.");
        }
    };

    /**
     * MOTOR DE GESTIÓN DE LEADS (INTERVENCIONES)
     * Objetivo: Sincronizar las solicitudes de consultoría capturadas en la nube.
     */
    const loadInterventionsList = async () => {
        const tableBody = document.getElementById('table-requests-body');
        const countEl = document.getElementById('requests-count');
        if (!tableBody) return;

        try {
            // Trazabilidad: Sincronizamos con el estándar de fecha del ecosistema (fechaEnvio) para visibilidad total
            const q = query(collection(db, "solicitudes_contacto"), orderBy("fechaEnvio", "desc"));
            const querySnapshot = await getDocs(q);
            
            if (countEl) countEl.innerText = `${querySnapshot.size} SOLICITUDES`;

            if (querySnapshot.empty) {
                tableBody.innerHTML = `<tr><td colspan="5" style="padding:30px; text-align:center; color:#999;">No hay solicitudes de intervención pendientes.</td></tr>`;
                return;
            }

            tableBody.innerHTML = querySnapshot.docs.map(docSnap => {
                const req = docSnap.data();
                
                // TRACEABILIDAD: Unificación de Identidad (Garantiza que el nombre viaje al correo)
                const nombreSeguro = req.nombre || req.clienteNombre || "Líder Dreams";
                const emailSeguro = req.email || req.clienteEmail;
                const servicioSeguro = req.interes || req.servicioTitulo || "Servicio Dreams";

                const rawDate = req.fechaEnvio || req.fechaSolicitud || new Date().toISOString();
                const fecha = new Date(rawDate).toLocaleDateString('es-MX', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                return `
                <tr style="border-bottom: 1px solid #f4f4f4; transition: background 0.2s;" onmouseover="this.style.background='#fafafa'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 15px;">
                        <div style="font-weight: 600; color: var(--primary-midnight);">${nombreSeguro}</div>
                        <div style="font-size: 0.75rem; color: #999;">${emailSeguro}</div>
                    </td>
                    <td style="padding: 15px;">
                        <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase;">${servicioSeguro}</div>
                    </td>
                    <td style="padding: 15px; font-size: 0.75rem; color: #666;">${fecha}</td>
                    <td style="padding: 15px;">
                        ${(req.estado === 'aprobado' || req.status === 'aprobado') ? `
                            <span style="background: #e6fffa; color: #065f46; padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; border: 1px solid #34d399;">
                                ✅ ACTIVADO
                            </span>
                        ` : `
                            <span style="background: #fff8e6; color: #856404; padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase;">
                                ⏳ PENDIENTE
                            </span>
                        `}
                    </td>
                    <td style="padding: 15px; text-align: right; display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="sendPurchaseCart('${emailSeguro}', '${nombreSeguro}', '${servicioSeguro}')" 
                                style="background: #f0f4f8; border: none; cursor: pointer; color: var(--primary-midnight); font-size: 1rem; padding: 5px; border-radius: 4px; display: flex; align-items: center; border: 1px solid rgba(15, 52, 96, 0.1);" 
                                title="Enviar Carrito de Compra">
                            ✉️ <span style="font-size: 0.6rem; margin-left: 6px; font-weight: 800;">ENVIAR CARRITO</span>
                        </button>
                        <button onclick="confirmDeleteIntervention('${docSnap.id}')" style="background: none; border: none; cursor: pointer; color: #dc2626; font-size: 1.1rem;" title="Eliminar Registro">🗑️</button>
                    </td>
                </tr>`;
            }).join('');
        } catch (error) {
            console.error("🚨 Error al cargar intervenciones:", error);
        }
    };

    /**
     * confirmDeleteIntervention - Protocolo de Limpieza de Bandeja
     */
    window.confirmDeleteIntervention = async (id) => {
        if (confirm("⚠️ ¿Deseas eliminar este registro de intervención?\nEsta acción es irreversible.")) {
            try {
                await deleteDoc(doc(db, "solicitudes_contacto", id));
                loadInterventionsList(); // Refresco quirúrgico
            } catch (error) {
                alert("🚨 Error al eliminar el registro.");
            }
        }
    };

    /**
     * approveQuickIA - Protocolo de Activación Express
     * Vincula la solicitud de la nube con el permiso real del usuario.
     */
    /**
     * sendPurchaseCart - Protocolo Comercial Prestige
     * Dispara el flujo de correo con el enlace al carrito de compras.
     */
    window.sendPurchaseCart = async (email, nombre, servicio) => {
        if (!confirm(`🚀 ¿Enviar enlace de compra para "${servicio}" a ${nombre}?`)) return;

        try {
            // PROTOCOLO COMERCIAL: Conexión con el Servidor de Notificaciones (Dreams Prestige Engine)
            const payload = {
                destinatario: email,
                cliente: { email: email, nombre: nombre },
                servicio: { titulo: servicio, id: 'link_carrito' },
                tipo: 'CARRITO_COMPRA',
                omitirRegistroFirestore: true
            };

            const response = await fetch('/.netlify/functions/intervencion-notificacion', {
                method: 'POST',
                headers: { 
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(`✅ Enlace de compra enviado con éxito a ${email}.`);
            } else {
                throw new Error("Fallo en la respuesta del servidor de correos");
            }
        } catch (error) {
            console.error("🚨 Error en protocolo de envío:", error);
            alert("Hubo un error al intentar enviar el correo. Revisa la conexión o las variables de entorno.");
        }
    };

    // Actualización del registro maestro de datos (Centralizado)
    window.initAdminData = () => {
        loadAdminStats();
        loadUsersList();
        loadCoursesList();
        loadServicesList();
        loadInterventionsList(); // Inyección de la bandeja de leads
    };
});
//public/src/apps/apps-logic.js

// TRACEABILIDAD: Importación centralizada desde el núcleo de configuración de Dreams
import { db, auth, collection, getDocs, doc, getDoc, setDoc } from '../shared/firebase-config.js';

/**
 * Contacto Apps — completa teléfonos cuando los definas (formato E.164 recomendado para Llamada).
 * WhatsApp: solo dígitos con lada de país, sin + ni espacios (ej. 525512345678).
 * Videollamada: misma página que public/agendar.html (Calendly; la sala Zoom se confirma al agendar),
 * alineado con netlify/functions/intervencion-notificacion.js (enlace a agendar.html?service=…).
 */
const APPS_CONTACT = {
    phoneE164: '',
    whatsappDigits: '',
    email: 'contacto@miempresacrece.com.mx',
};

const APPS_SCHEDULE_PAGE = 'agendar.html';

const APPS_CONTACT_PENDING_MSG = 'Estamos actualizando este canal. Mientras tanto escribe a contacto@miempresacrece.com.mx o usa Videollamada para agendar en Calendly.';

/**
 * Plantillas personalizables (placeholders: {{nombre}}, {{empresa}}, {{email}}, {{appNombre}}, {{appId}}).
 * Tras hacer clic en Correo o WhatsApp se abre el cliente con este texto y, en paralelo, se envía
 * un correo de respaldo vía netlify/functions/intervencion-notificacion.js (tipo CONTACTO_APPS_CANAL).
 */
const APPS_MESSAGE_TEMPLATES = {
    emailSubject: 'Consulta desde la plataforma — {{appNombre}}',
    emailBody: `Hola equipo Mi Empresa Crece,

Soy {{nombre}} ({{email}}), de {{empresa}}.

Escribo desde el módulo de Aplicaciones de la plataforma Dreams por la herramienta «{{appNombre}}» (referencia: {{appId}}).

Me gustaría recibir información y/o agendar para conocer más del producto.

[Describe aquí tu necesidad o disponibilidad]


Saludos cordiales,
{{nombre}}`,
    whatsapp: 'Hola, soy *{{nombre}}* ({{email}}). Empresa: *{{empresa}}*. Escribo desde ME Crece Platform por la app *{{appNombre}}*. Me gustaría información y agendar para conocer más. ¡Gracias!',
};

const appsContactPayloadCache = new Map();

function fillAppsTemplate(template, vars) {
    return String(template).replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const v = vars[key];
        return v != null && v !== '' ? String(v) : '';
    });
}

function buildAppsTemplateVars(profile, app) {
    const email = profile.email || '';
    const nombre = profile.nombre || (email ? email.split('@')[0] : 'Cliente');
    const empresa = profile.empresa && String(profile.empresa).trim()
        ? profile.empresa
        : '(indica el nombre de tu empresa)';
    return {
        nombre,
        empresa,
        email,
        appNombre: app.name || app.id,
        appId: app.id,
    };
}

function notifyAppsContactChannel(canal, appId) {
    const user = auth.currentUser;
    const payload = appsContactPayloadCache.get(appId);
    if (!user || !payload) return;

    const cuerpoTexto = canal === 'email' ? payload.emailBody : payload.whatsappText;
    const body = {
        tipo: 'CONTACTO_APPS_CANAL',
        canal,
        destinatario: user.email,
        cliente: {
            uid: user.uid,
            email: user.email,
            nombre: payload.profile.nombre,
            empresa: payload.profile.empresa || '',
        },
        servicio: { id: payload.app.id, titulo: payload.app.name },
        cuerpoTexto,
        asuntoPlantilla: payload.emailSubject,
        omitirRegistroFirestore: false,
    };

    fetch('/.netlify/functions/intervencion-notificacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }).catch(() => {});
}

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * MOTOR DE SOLICITUD QUIRÚRGICO (Replica flujo de Consultoría)
 */
window.requestAppAccess = async (appId, appName) => {
    const user = auth.currentUser;
    if (!user) {
        alert("Por favor, inicia sesión para solicitar acceso.");
        return;
    }

    const confirmacion = confirm(`¿Deseas solicitar la activación de ${appName} y agendar una sesión de configuración?`);
    if (!confirmacion) return;

    try {
        const profileSnap = await getDoc(doc(db, "usuarios", user.uid));
        const userData = profileSnap.exists() ? profileSnap.data() : {};
        const nombreUsuario = userData.nombre || user.email.split('@')[0];

        const solicitudId = `app_req_${appId}_${Date.now()}`;
        await setDoc(doc(db, "solicitudes_contacto", solicitudId), {
            usuarioId: user.uid,
            email: user.email,
            nombre: nombreUsuario,
            interes: `Acceso App: ${appName}`,
            servicioId: appId,
            estado: "pendiente",
            fechaEnvio: new Date().toISOString(),
            canal: "Dashboard Apps"
        });

        await fetch('/.netlify/functions/intervencion-notificacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                destinatario: user.email,
                cliente: { uid: user.uid, email: user.email, nombre: nombreUsuario },
                servicio: { id: appId, titulo: appName },
                tipo: 'CARRITO_COMPRA',
                omitirRegistroFirestore: true
            })
        });

        alert(`🚀 Solicitud registrada.\n\nPara finalizar, selecciona tu horario en la siguiente pantalla.`);
        window.location.href = `agendar.html?service=${appId}`;
    } catch (error) {
        console.error("🚨 Error en solicitud de App:", error);
        alert("Hubo un problema al procesar tu solicitud. Por favor intenta de nuevo.");
    }
};

function digitsOnly(s) {
    return String(s ?? '').replace(/\D/g, '');
}

/** UA móvil/tablet: api.whatsapp.com suele abrir la app. Escritorio: web.whatsapp.com/send abre WhatsApp Web (o el cliente de escritorio si el sistema enlaza el dominio). */
const WHATSAPP_MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

/**
 * Con número (lada + dígitos): abre chat hacia ese teléfono con mensaje precargado.
 */
function buildWhatsAppSendUrl(phoneDigits, text) {
    const q = encodeURIComponent(text);
    const base = `phone=${phoneDigits}&text=${q}`;
    if (WHATSAPP_MOBILE_UA.test(navigator.userAgent || '')) {
        return `https://api.whatsapp.com/send/?${base}`;
    }
    return `https://web.whatsapp.com/send?${base}`;
}

/**
 * Sin número en APPS_CONTACT: abre WhatsApp Web o la app con solo el texto sugerido (el usuario elige el contacto).
 * Así el botón funciona aunque whatsappDigits esté vacío.
 */
function buildWhatsAppSendUrlWithoutPhone(text) {
    const q = encodeURIComponent(text || '');
    const hasText = Boolean(text && String(text).trim());
    if (WHATSAPP_MOBILE_UA.test(navigator.userAgent || '')) {
        return hasText
            ? `https://api.whatsapp.com/send/?text=${q}`
            : 'https://api.whatsapp.com/';
    }
    return hasText
        ? `https://web.whatsapp.com/send?text=${q}`
        : 'https://web.whatsapp.com/';
}

function buildWhatsAppOpenUrl(phoneDigits, text) {
    const d = digitsOnly(phoneDigits);
    if (d.length >= 10) {
        return buildWhatsAppSendUrl(d, text);
    }
    return buildWhatsAppSendUrlWithoutPhone(text);
}

/**
 * Abre WhatsApp en pestaña nueva. Sin noopener/noreferrer en window.open para no interferir
 * con el manejo del SO hacia WhatsApp Desktop cuando corresponda.
 * Si el bloqueador de ventanas impide abrir, navega en la misma pestaña.
 */
function openWhatsAppComposeUrl(url) {
    if (!url || url === '#') return;
    const win = window.open(url, '_blank');
    if (win == null) {
        window.location.assign(url);
    }
}

function buildAppContactActionsHtml(app, tieneAcceso, routeEscaped) {
    const appNamePlain = app.name || app.id;

    const phoneDigits = digitsOnly(APPS_CONTACT.phoneE164);
    const phoneOk = phoneDigits.length >= 10;
    const phoneHref = phoneOk ? `tel:${APPS_CONTACT.phoneE164.replace(/\s/g, '')}` : '#';
    const phoneClass = phoneOk ? 'apps-contact-btn' : 'apps-contact-btn apps-contact-btn--pending';

    const waDigitsCfg = digitsOnly(APPS_CONTACT.whatsappDigits);
    const waOk = waDigitsCfg.length >= 10;
    const waClass = 'apps-contact-btn apps-contact-wa';

    const scheduleHref = `${APPS_SCHEDULE_PAGE}?service=${encodeURIComponent(app.id)}`;
    const openAppBlock = tieneAcceso && routeEscaped
        ? `<p class="apps-pillar-open-wrap"><a class="apps-open-app-link" href="${routeEscaped}">Abrir aplicación →</a></p>`
        : '';
    const requestBlock = !tieneAcceso
        ? `<p class="apps-pillar-request-wrap"><button type="button" class="apps-request-access-btn" data-app-id="${escapeAttr(app.id)}" data-app-name="${escapeAttr(appNamePlain)}">Solicitar activación en mi expediente</button></p>`
        : '';

    return `
        <div class="apps-pillar-actions" role="group" aria-label="Contacto y agenda">
            <a href="${phoneHref}" class="${phoneClass}" title="${phoneOk ? 'Llamada telefónica' : 'Número por configurar'}">📞 Llamada</a>
            <a href="#" class="${waClass}" data-app-id="${escapeAttr(app.id)}" title="${waOk ? 'WhatsApp: chat directo al número configurado' : 'WhatsApp Web o app (mensaje sugerido; configura whatsappDigits para número fijo)'}">💬 WhatsApp</a>
            <a href="#" class="apps-contact-btn apps-contact-email" data-app-id="${escapeAttr(app.id)}" title="Correo a ${escapeAttr(APPS_CONTACT.email)} con plantilla">✉️ Correo</a>
            <a href="${scheduleHref}" class="apps-contact-btn apps-contact-btn--schedule" title="Agenda sesión estratégica (videollamada vía Zoom según tu cita)">📹 Videollamada</a>
        </div>
        ${openAppBlock}
        ${requestBlock}`;
}

/**
 * Misma microinteracción que #view-categories .academia-pillars-list en academia.js
 */
function wireAppsPillarsHover(pillarsList) {
    if (!pillarsList || pillarsHoverBound) return;
    pillarsHoverBound = true;

    const refreshCards = () => pillarsList.querySelectorAll('li.apps-pillar-item');

    pillarsList.addEventListener('mouseover', (e) => {
        const hoveredCard = e.target.closest('li.apps-pillar-item');
        if (!hoveredCard || !pillarsList.contains(hoveredCard)) return;

        const cards = refreshCards();
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
        refreshCards().forEach((card) => {
            card.style.filter = 'none';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
            card.style.zIndex = '1';
        });
    });
}

function animatePillarCards(pillarsList) {
    const cards = pillarsList.querySelectorAll('li.apps-pillar-item');
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
}

let pillarsHoverBound = false;
let pillarsActionsBound = false;

function bindPillarsActionsOnce(pillarsList) {
    if (pillarsActionsBound || !pillarsList) return;
    pillarsActionsBound = true;

    pillarsList.addEventListener('click', (e) => {
        const pending = e.target.closest('.apps-contact-btn--pending');
        if (pending && !pending.classList.contains('apps-contact-wa') && pillarsList.contains(pending)) {
            e.preventDefault();
            alert(APPS_CONTACT_PENDING_MSG);
            return;
        }

        const mailBtn = e.target.closest('.apps-contact-email');
        if (mailBtn && pillarsList.contains(mailBtn)) {
            e.preventDefault();
            const id = mailBtn.dataset.appId;
            const p = id ? appsContactPayloadCache.get(id) : null;
            if (p?.mailtoUrl) {
                notifyAppsContactChannel('email', id);
                window.location.href = p.mailtoUrl;
            }
            return;
        }

        const waBtn = e.target.closest('.apps-contact-wa');
        if (waBtn && pillarsList.contains(waBtn)) {
            e.preventDefault();
            const id = waBtn.dataset.appId;
            const p = id ? appsContactPayloadCache.get(id) : null;
            if (p?.waUrl) {
                notifyAppsContactChannel('whatsapp', id);
                openWhatsAppComposeUrl(p.waUrl);
            }
            return;
        }

        const req = e.target.closest('.apps-request-access-btn');
        if (req && pillarsList.contains(req)) {
            e.preventDefault();
            const id = req.dataset.appId;
            const name = req.dataset.appName || '';
            if (id) window.requestAppAccess(id, name);
        }
    });
}

async function renderApps() {
    const list = document.getElementById('apps-pillars-list');
    const loading = document.getElementById('loading-apps');
    const user = auth.currentUser;

    if (!list) return;

    if (!user) {
        if (loading) loading.style.display = 'none';
        list.hidden = false;
        list.innerHTML = `
            <li class="academia-pillar-item apps-pillar-item" style="cursor: default;">
                <div class="academia-pillar-copy"><strong>Acceso al ecosistema</strong> — Inicia sesión en la plataforma para ver las aplicaciones asociadas a tu expediente y solicitar nuevas activaciones.</div>
            </li>`;
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, "expedientes", user.uid));
        const userData = userDoc.data();
        const appsContratadas = userData?.servicios?.apps || {};

        const profileSnap = await getDoc(doc(db, "usuarios", user.uid));
        const profileData = profileSnap.exists() ? profileSnap.data() : {};
        const profile = {
            nombre: profileData.nombre || user.email?.split('@')[0] || 'Cliente',
            empresa: profileData.empresa || '',
            email: user.email || '',
        };

        const querySnapshot = await getDocs(collection(db, "config_apps"));
        const items = [];
        querySnapshot.forEach((d) => {
            items.push({ id: d.id, ...d.data() });
        });
        items.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'es'));

        if (loading) loading.style.display = 'none';
        list.hidden = false;

        if (items.length === 0) {
            list.innerHTML = `
                <li class="academia-pillar-item apps-pillar-item" style="cursor: default;">
                    <div class="academia-pillar-copy"><strong>Catálogo en sincronización</strong> — Aún no hay aplicaciones publicadas en el ecosistema. Vuelve más tarde o contacta a soporte.</div>
                </li>`;
            return;
        }

        appsContactPayloadCache.clear();

        const hoy = new Date();
        let html = '';
        items.forEach((app, index) => {
            const infoContrato = appsContratadas[app.id];
            let vencimiento = infoContrato?.fechaVencimiento;
            if (vencimiento && typeof vencimiento.toDate === 'function') {
                vencimiento = vencimiento.toDate();
            }
            const tieneAcceso = !!(infoContrato && vencimiento && vencimiento > hoy);
            const lockedClass = tieneAcceso ? '' : ' apps-pillar-item--locked';
            const icon = app.icon ? `${escapeHtml(app.icon)} ` : '';
            const name = escapeHtml(app.name || app.id);
            const desc = escapeHtml(app.description || '');
            const route = escapeAttr(app.route || '');
            const ariaName = escapeAttr(app.name || app.id);

            const vars = buildAppsTemplateVars(profile, app);
            const emailSubject = fillAppsTemplate(APPS_MESSAGE_TEMPLATES.emailSubject, vars);
            const emailBody = fillAppsTemplate(APPS_MESSAGE_TEMPLATES.emailBody, vars);
            const whatsappText = fillAppsTemplate(APPS_MESSAGE_TEMPLATES.whatsapp, vars);
            const mailtoUrl = `mailto:${APPS_CONTACT.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            const waDigits = digitsOnly(APPS_CONTACT.whatsappDigits);
            const waUrl = buildWhatsAppOpenUrl(waDigits, whatsappText);

            appsContactPayloadCache.set(app.id, {
                emailSubject,
                emailBody,
                whatsappText,
                mailtoUrl,
                waUrl,
                profile,
                app: { id: app.id, name: app.name || app.id },
            });

            const actionsHtml = buildAppContactActionsHtml(app, tieneAcceso, route);

            html += `
            <li class="academia-pillar-item apps-pillar-item${lockedClass}" aria-label="${ariaName}">
                <div class="academia-pillar-copy"><strong>${index + 1}. ${icon}${name}</strong> — ${desc}</div>
                ${actionsHtml}
            </li>`;
        });

        list.innerHTML = html;
        animatePillarCards(list);
        bindPillarsActionsOnce(list);
        wireAppsPillarsHover(list);
    } catch (error) {
        console.error("Error en el despliegue de Apps:", error);
        if (loading) loading.style.display = 'none';
        list.hidden = false;
        list.innerHTML = `<li class="academia-pillar-item apps-pillar-item" style="cursor: default;"><div class="academia-pillar-copy">Error al sincronizar con el ecosistema. Intenta de nuevo más tarde.</div></li>`;
    }
}

auth.onAuthStateChanged(() => {
    renderApps();
});

// FUNCIÓN DE EMERGENCIA PARA POBLAR EL CATÁLOGO (USO ÚNICO)
window.setupAppsMaster = async () => {
    const apps = [
        { id: "app-crm", name: "CRM Ventas", description: "Gestión de embudos y prospectos de alto valor.", route: "apps/crm/index.html", icon: "📈" },
        { id: "app-erp", name: "ERP Finanzas", description: "Control de flujo de caja y salud financiera.", route: "apps/erp/index.html", icon: "💰" }
    ];

    try {
        const { setDoc, doc: docFn } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        for (const app of apps) {
            await setDoc(docFn(db, "config_apps", app.id), app);
            console.log(`✅ App ${app.id} sincronizada.`);
        }
        alert("Catálogo creado con éxito. Recarga la página.");
    } catch (e) {
        console.error("Error de permisos: Asegúrate de estar logueado como Admin.", e);
    }
};

document.addEventListener('input', (e) => {
    if (e.target.id === 'app-searcher') {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#apps-pillars-list li.apps-pillar-item');

        rows.forEach((row) => {
            const text = row.innerText.toLowerCase();
            if (text.includes(term)) {
                row.style.display = '';
                row.style.opacity = '1';
            } else {
                row.style.display = 'none';
                row.style.opacity = '0';
            }
        });
    }
});

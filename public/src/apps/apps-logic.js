//public/src/apps/apps-logic.js

// TRACEABILIDAD: Importación centralizada desde el núcleo de configuración de Dreams
import { db, auth, collection, getDocs, doc, getDoc, setDoc } from '../shared/firebase-config.js';

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

function openPillarApp(row) {
    const hasAccess = row.dataset.hasAccess === '1';
    const appId = row.dataset.appId;
    const appName = row.dataset.appName || '';
    const route = row.dataset.route || '';

    if (hasAccess && route) {
        window.location.href = route;
        return;
    }
    if (!hasAccess && appId) {
        window.requestAppAccess(appId, appName);
    }
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

let pillarsClickBound = false;
let pillarsHoverBound = false;

function bindPillarsClickOnce(pillarsList) {
    if (pillarsClickBound || !pillarsList) return;
    pillarsClickBound = true;

    pillarsList.addEventListener('click', (e) => {
        const row = e.target.closest('.apps-pillar-item');
        if (!row || !pillarsList.contains(row)) return;
        openPillarApp(row);
    });

    pillarsList.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const row = e.target.closest('.apps-pillar-item');
        if (!row || !pillarsList.contains(row)) return;
        e.preventDefault();
        openPillarApp(row);
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
            const btnLabel = tieneAcceso ? 'INGRESAR' : 'SOLICITAR ACCESO';
            const icon = app.icon ? `${escapeHtml(app.icon)} ` : '';
            const name = escapeHtml(app.name || app.id);
            const desc = escapeHtml(app.description || '');
            const route = escapeAttr(app.route || '');
            const ariaName = escapeAttr(app.name || app.id);

            html += `
            <li class="academia-pillar-item apps-pillar-item${lockedClass}"
                data-app-id="${escapeAttr(app.id)}"
                data-app-name="${escapeAttr(app.name || app.id)}"
                data-has-access="${tieneAcceso ? '1' : '0'}"
                data-route="${route}"
                tabindex="0"
                role="button"
                aria-label="${ariaName}: ${tieneAcceso ? 'abrir aplicación' : 'solicitar acceso'}">
                <div class="academia-pillar-copy"><strong>${index + 1}. ${icon}${name}</strong> — ${desc}</div>
                <button type="button" class="btn-primary btn-pillar-enter">${btnLabel}</button>
            </li>`;
        });

        list.innerHTML = html;
        animatePillarCards(list);
        bindPillarsClickOnce(list);
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
        { id: "app-crm", name: "CRM Ventas Prestige", description: "Gestión de embudos y prospectos de alto valor.", route: "apps/crm/index.html", icon: "📈" },
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

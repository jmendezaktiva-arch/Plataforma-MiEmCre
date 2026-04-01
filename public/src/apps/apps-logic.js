//public/src/apps/apps-logic.js

// TRACEABILIDAD: Importación centralizada desde el núcleo de configuración de Dreams
import { db, auth, collection, getDocs, doc, getDoc } from '../shared/firebase-config.js';

// CONFIGURACIÓN DE IDENTIDAD VISUAL (LIMPIEZA PARA MODALIDAD COMPACTA)
const APP_TEMPLATES = {
    active: (app) => `
        <article class="card bento-item glass-card bento-kpi-card animate-fade-in">
            <div class="card-content" style="display: flex; flex-direction: column; height: 100%; width: 100%;">
                <div class="card-header-app">
                    <div class="app-icon">${app.icon || '🚀'}</div>
                    <span class="card-category" style="color: var(--accent-gold); display: block; margin-bottom: 5px;">Herramienta de Autoridad</span>
                    <h3 style="color: var(--primary-midnight); margin: 0;">${app.name}</h3>
                    <p>${app.description}</p>
                </div>
                <div class="card-footer-app">
                    <button class="btn-primary" onclick="window.location.href='${app.route}'">ABRIR HERRAMIENTA</button>
                    <div class="status-tag status-active">
                        Acceso Total Sincronizado
                    </div>
                </div>
            </div>
        </article>`,
    locked: (app) => `
        <article class="card bento-item glass-card locked-opacity">
            <div class="card-content" style="display: flex; flex-direction: column; height: 100%; width: 100%; filter: grayscale(1);">
                <div class="card-header-app">
                    <div class="app-icon" style="opacity: 0.5;">🔒</div>
                    <span class="card-category" style="color: #718096; display: block; margin-bottom: 5px;">Módulo Restringido</span>
                    <h3 style="color: #4A5568; margin: 0;">${app.name}</h3>
                    <p>${app.description}</p>
                </div>
                <div class="card-footer-app">
                    <button class="btn-primary" style="background: #E2E8F0; color: #94A3B8; border: none; cursor: not-allowed;" disabled>ADQUIRIR ACCESO</button>
                    <div class="status-tag status-expired">
                        ⚠️ Vigencia Expirada
                    </div>
                </div>
            </div>
        </article>`
};

async function renderApps() {
    const grid = document.getElementById('apps-grid');
    const user = auth.currentUser;

    if (!user) return;

    try {
        // 1. OBTENER EXPEDIENTE DEL USUARIO (SENTINEL)
        const userDoc = await getDoc(doc(db, "expedientes", user.uid));
        const userData = userDoc.data();
        const appsContratadas = userData?.servicios?.apps || {};

        // 2. OBTENER CATÁLOGO MAESTRO DE APPS
        const querySnapshot = await getDocs(collection(db, "config_apps"));
        grid.innerHTML = ''; // Limpiar spinner de carga

        querySnapshot.forEach((doc) => {
            const app = doc.data();
            const infoContrato = appsContratadas[doc.id];

            // 3. LÓGICA DEL SENTINEL DE SEGURIDAD
            const hoy = new Date();
            const vencimiento = infoContrato?.fechaVencimiento?.toDate();
            const tieneAcceso = infoContrato && vencimiento > hoy;

            // 4. RENDERIZADO CONDICIONAL
            grid.innerHTML += tieneAcceso ? APP_TEMPLATES.active(app) : APP_TEMPLATES.locked(app);
        });

    } catch (error) {
        console.error("Error en el despliegue de Apps:", error);
        grid.innerHTML = `<p class="text-error">Error al sincronizar con el ecosistema. Intenta de nuevo.</p>`;
    }
}

// Iniciar cuando el usuario esté autenticado
auth.onAuthStateChanged((user) => {
    if (user) renderApps();
});

// FUNCIÓN DE EMERGENCIA PARA POBLAR EL CATÁLOGO (USO ÚNICO)
window.setupAppsMaster = async () => {
    const apps = [
        { id: "app-crm", name: "CRM Ventas Prestige", description: "Gestión de embudos y prospectos de alto valor.", route: "apps/crm/index.html", icon: "📈" },
        { id: "app-erp", name: "ERP Finanzas", description: "Control de flujo de caja y salud financiera.", route: "apps/erp/index.html", icon: "💰" }
    ];

    try {
        const { setDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        for (const app of apps) {
            await setDoc(doc(db, "config_apps", app.id), app);
            console.log(`✅ App ${app.id} sincronizada.`);
        }
        alert("Catálogo creado con éxito. Recarga la página.");
    } catch (e) {
        console.error("Error de permisos: Asegúrate de estar logueado como Admin.", e);
    }
};

// MOTOR DE BÚSQUEDA AURA - FILTRADO EN TIEMPO REAL
document.addEventListener('input', (e) => {
    if (e.target.id === 'app-searcher') {
        const term = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('#apps-grid article');
        
        cards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const description = card.querySelector('p').innerText.toLowerCase();
            
            // Si el término coincide con el título o la descripción, se muestra; si no, se oculta suavemente.
            if (title.includes(term) || description.includes(term)) {
                card.style.display = "flex";
                card.style.opacity = "1";
            } else {
                card.style.display = "none";
                card.style.opacity = "0";
            }
        });
    }
});
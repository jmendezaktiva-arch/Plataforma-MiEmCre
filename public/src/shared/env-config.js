// public/src/shared/env-config.js
// Este archivo contiene datos sensibles y NO se sube a GitHub
window.DREAMS_CONFIG = window.DREAMS_CONFIG || {
    // Configuración de Persistencia (Legacy - Mantener para no romper trazabilidad actual)
    GOOGLE_SHEET_ID: "1GNbQjlBNO-Ytv_2aon3fWJw9zJGiq6sKVmIHlHbwHsI",
    APP_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyvbuq5lhK2YiCD_pv5ui85cuZI0ntTgQvj2aLQaWKdvi3-R17kbU1SjOLWUUkhudBtgQ/exec",

    // Configuración de Media (Firebase Storage & YouTube)
    // Estandarizado a .firebasestorage.app para coincidir con firebase-config.js
    FIREBASE_STORAGE_BASE: "https://firebasestorage.googleapis.com/v0/b/dreams-d1334.firebasestorage.app/o/",
    YOUTUBE_BASE_URL: "https://www.youtube.com/embed/",
    
    // Control de Entorno
    MODO_DESARROLLO: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    // MOTOR DE RUTAS UNIVERSAL V1.4 (QUIRÚRGICO)
    // Optimizado para YouTube, Audio (mp3/wav) y Video (mp4) en Mi Empresa Crece Platform.
    resolvePath: (fileName, session = 'shared') => {
        if (!fileName || typeof fileName !== 'string') return ''; 
        if (fileName.startsWith('http')) return fileName;
        
        if (fileName.length === 11 && !fileName.includes('.')) {
            return `${window.DREAMS_CONFIG.YOUTUBE_BASE_URL}${fileName}`;
        }

        const sessionInput = session.toLowerCase();
        const ext = fileName.split('.').pop().toLowerCase();
        // INTERCEPTOR DE ACTIVOS GLOBALES: Identifica archivos que pertenecen al repositorio central
        // independientemente de la sesión en la que se encuentre el usuario.
        const globalAssets = ['contacto.png', 'reglas.png', 'guias.png', 'recorrido.png', 'logo.png'];
        const isShared = sessionInput === 'shared' || globalAssets.includes(fileName.toLowerCase());
        const folderName = isShared ? 'Shared' : `sesion-${sessionInput.replace('sesion-', '').replace('sesion_', '')}`;
        
        let subFolder = '';
        if (isShared) {
            subFolder = fileName.toLowerCase().includes('logo') ? 'brand' : 'slides';
        } else {
            const mediaExts = ['mp3', 'wav', 'mp4', 'webm', 'mpeg'];
            subFolder = mediaExts.includes(ext) ? 'media' : 'images';
        }

        const fullPath = `shared%2F${folderName}%2F${subFolder}%2F${encodeURIComponent(fileName)}`;
        return `${window.DREAMS_CONFIG.FIREBASE_STORAGE_BASE}${fullPath}?alt=media`;
    }
};
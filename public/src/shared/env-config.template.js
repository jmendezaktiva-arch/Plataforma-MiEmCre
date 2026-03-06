// public/src/shared/env-config.template.js (Versión para Producción)
const DREAMS_CONFIG = {
    // Estas variables las leerá del panel de Netlify si usas un build step, 
    // pero para tu arquitectura actual, usaremos un "Fallback" inteligente:
    FIREBASE_STORAGE_BASE: "https://firebasestorage.googleapis.com/v0/b/dreams-d1334.firebasestorage.app/o/",
    YOUTUBE_BASE_URL: "https://www.youtube.com/embed/",
    
    MODO_DESARROLLO: window.location.hostname === 'localhost',

    resolvePath: (fileName, session = 'shared') => {
        if (!fileName || typeof fileName !== 'string') return ''; 
        if (fileName.startsWith('http')) return fileName;
        
        // 1. DETECCIÓN INTELIGENTE DE YOUTUBE: 
        // Si el texto tiene 11 caracteres y no tiene punto (extensión), es un ID de video.
        if (fileName.length === 11 && !fileName.includes('.')) {
            return `${DREAMS_CONFIG.YOUTUBE_BASE_URL}${fileName}`;
        }

        const sessionInput = session.toLowerCase();
        const ext = fileName.split('.').pop().toLowerCase();
        
        // 2. NORMALIZACIÓN DE CARPETA RAÍZ:
        // 'shared' apunta a la carpeta 'Shared' (Mayúscula), sesiones a 'sesion-x'.
        // INTERCEPTOR DE ACTIVOS GLOBALES: Identifica archivos que pertenecen al repositorio central
        // independientemente de la sesión en la que se encuentre el usuario.
        const globalAssets = ['contacto.png', 'reglas.png', 'guias.png', 'recorrido.png', 'logo.png'];
        const isShared = sessionInput === 'shared' || globalAssets.includes(fileName.toLowerCase());
        const folderName = isShared ? 'Shared' : `sesion-${sessionInput.replace('sesion-', '').replace('sesion_', '')}`;
        
        // 3. DISCRIMINADOR QUIRÚRGICO DE SUB-CARPETAS:
        let subFolder = '';
        if (isShared) {
            // Regla para Shared: logos van a 'brand', el resto a 'slides'.
            subFolder = fileName.toLowerCase().includes('logo') ? 'brand' : 'slides';
        } else {
            // Regla para Sesiones: audios y videos van a 'media', el resto a 'images'.
            const mediaExts = ['mp3', 'wav', 'mp4', 'webm', 'mpeg'];
            subFolder = mediaExts.includes(ext) ? 'media' : 'images';
        }

        // 4. CONSTRUCCIÓN DE RUTA PARA FIREBASE STORAGE:
        // Respetamos la jerarquía: root (shared) > carpeta > subcarpeta > archivo.
        const fullPath = `shared%2F${folderName}%2F${subFolder}%2F${encodeURIComponent(fileName)}`;
        return `${DREAMS_CONFIG.FIREBASE_STORAGE_BASE}${fullPath}?alt=media`;
    }
};
window.DREAMS_CONFIG = DREAMS_CONFIG;
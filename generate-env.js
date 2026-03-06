const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'public', 'src', 'shared', 'env-config.js');

// Definimos la función resolvePath como un string exacto para evitar errores de entorno
const resolvePathString = `(fileName, session = 'shared') => {
        if (!fileName || typeof fileName !== 'string') return ''; 
        if (fileName.startsWith('http')) return fileName;
        
        if (fileName.length === 11 && !fileName.includes('.')) {
            return \`\${window.DREAMS_CONFIG.YOUTUBE_BASE_URL}\${fileName}\`;
        }

        const sessionInput = session.toLowerCase();
        const ext = fileName.split('.').pop().toLowerCase();
        const globalAssets = ['contacto.png', 'reglas.png', 'guias.png', 'recorrido.png', 'logo.png'];
        const isShared = sessionInput === 'shared' || globalAssets.includes(fileName.toLowerCase());
        const folderName = isShared ? 'Shared' : \`sesion-\${sessionInput.replace('sesion-', '').replace('sesion_', '')}\`;
        
        let subFolder = '';
        if (isShared) {
            subFolder = fileName.toLowerCase().includes('logo') ? 'brand' : 'slides';
        } else {
            const mediaExts = ['mp3', 'wav', 'mp4', 'webm', 'mpeg'];
            subFolder = mediaExts.includes(ext) ? 'media' : 'images';
        }

        const fullPath = \`shared%2F\${folderName}%2F\${subFolder}%2F\${encodeURIComponent(fileName)}\`;
        return \`\${window.DREAMS_CONFIG.FIREBASE_STORAGE_BASE}\${fullPath}?alt=media\`;
    }`;

const content = `// Archivo generado automáticamente por Netlify
window.DREAMS_CONFIG = window.DREAMS_CONFIG || {
    GOOGLE_SHEET_ID: "${process.env.GOOGLE_SHEET_ID || ''}",
    APP_SCRIPT_URL: "${process.env.APP_SCRIPT_URL || ''}",
    FIREBASE_STORAGE_BASE: "${process.env.FIREBASE_STORAGE_BASE || ''}",
    YOUTUBE_BASE_URL: "${process.env.YOUTUBE_BASE_URL || ''}",
    MODO_DESARROLLO: false,
    resolvePath: ${resolvePathString}
};`;

try {
    fs.writeFileSync(targetPath, content);
    console.log('✅ env-config.js generado con éxito.');
} catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
}
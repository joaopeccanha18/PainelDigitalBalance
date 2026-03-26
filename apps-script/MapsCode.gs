// ─────────────────────────────────────────────────────────────
// MAPS SCRIPT — Google Apps Script para os Mapas de Aulas
// Devolve o ficheiro mais recente das pastas de Piscina e Ginásio
// ─────────────────────────────────────────────────────────────
// URL do deploy (atualizado): https://script.google.com/macros/s/AKfycbz_UDeRCDGfCLC9XTFzaOgRYenBLxADZ5HsNEGKeC_D4FG992BU6y8zvHnDaUN9UBaI/exec

const MAPS_FOLDER_IDS = {
    piscina: '1OuPZTfPQ5M6Rwjya8kI0mtKEroeViUMK',
    ginasio: '17FSfXgBgtXtuzPwNXASKBROaCCT56ph3',
};

// ─────────────────────────────────────────────────────────────

// GET — devolve o URL do ficheiro mais recente de cada pasta
function doGet(e) {
    const result = {};
    for (const [key, folderId] of Object.entries(MAPS_FOLDER_IDS)) {
        result[key] = getLatestFileUrl(folderId);
    }
    return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

function getLatestFileUrl(folderId) {
    try {
        const folder  = DriveApp.getFolderById(folderId);
        const files   = folder.getFiles(); // Aceita todos os ficheiros (PDF, JPG, PNG, HEIC)
        let latest    = null;
        let latestDate = null;

        while (files.hasNext()) {
            const file = files.next();
            const date = file.getDateCreated();
            if (!latestDate || date > latestDate) {
                latestDate = date;
                latest = file;
            }
        }

        if (!latest) return '';

        latest.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return 'https://drive.google.com/file/d/' + latest.getId() + '/view';
    } catch (err) {
        Logger.log('Erro na pasta ' + folderId + ': ' + err);
        return '';
    }
}

// ─────────────────────────────────────────────────────────────
// MAPS SCRIPT — Google Apps Script para os Mapas de Aulas
// Devolve o PDF mais recente das pastas de Piscina e Ginásio
// ─────────────────────────────────────────────────────────────
// URL do deploy: https://script.google.com/macros/s/AKfycby3uwcVlcMoZBs_9ZnbJ_v_iLTsehkkafttn8Nc-Y6N49FBPg2JTSqNUDvX5aaP063h/exec

const MAPS_FOLDER_IDS = {
    piscina: '1OuPZTfPQ5M6Rwjya8kI0mtKEroeViUMK',
    ginasio: '17FSfXgBgtXtuzPwNXASKBROaCCT56ph3',
};

// ─────────────────────────────────────────────────────────────

// GET — devolve o URL do PDF mais recente de cada pasta
function doGet(e) {
    const result = {};
    for (const [key, folderId] of Object.entries(MAPS_FOLDER_IDS)) {
        result[key] = getLatestPdfUrl(folderId);
    }
    return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

function getLatestPdfUrl(folderId) {
    try {
        const folder  = DriveApp.getFolderById(folderId);
        const files   = folder.getFilesByType(MimeType.PDF);
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

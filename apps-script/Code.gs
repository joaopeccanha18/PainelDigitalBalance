// ─────────────────────────────────────────────────────────────
// FOTOS SCRIPT — Google Apps Script para as Fotos (3 categorias)
// ─────────────────────────────────────────────────────────────
// URL do deploy: https://script.google.com/macros/s/AKfycbwz9c1ClR3N8W4hiaQLMJhsV3aJjmVfRbA0eAnBTFf7dFxKvZiDW7q2MG3i9WFqTQWevA/exec

const FOLDER_IDS = {
    staff:         '1KDu9D9YRTN8ikJl5aC1SlWnIRcSuSLzF',
    aulasGrupo:    '1WVnPSpJMOuF1H9vTXMZQfg0fLUFUTsKA',
    espacoBalance: '1U_6E8GrhsCZdM7B0bWPqhFKaSLVArV5c',
};

// ─────────────────────────────────────────────────────────────

// GET — devolve lista de fotos das 3 categorias
function doGet(e) {
    const result = {};
    for (const [key, folderId] of Object.entries(FOLDER_IDS)) {
        result[key] = getPhotosFromFolder(folderId);
    }
    return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

function getPhotosFromFolder(folderId) {
    try {
        const folder = DriveApp.getFolderById(folderId);
        const files  = folder.getFilesByType(MimeType.JPEG);
        const photos = [];
        while (files.hasNext()) {
            const file = files.next();
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            photos.push({
                id:   file.getId(),
                name: file.getName().replace(/\.[^.]+$/, '').replace(/_\d+$/, ''),
                date: file.getDateCreated().toISOString(),
            });
        }
        // Mais recente primeiro
        return photos.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (err) {
        Logger.log('Erro na pasta ' + folderId + ': ' + err);
        return [];
    }
}

// POST — recebe upload de foto e guarda na pasta da categoria
function doPost(e) {
    try {
        const payload  = JSON.parse(e.postData.contents);
        const category = payload.category || 'staff';
        const folderId = FOLDER_IDS[category];

        if (!folderId) throw new Error('Categoria inválida: ' + category);

        const base64Data = payload.image.replace(/^data:image\/[a-z]+;base64,/, '');
        const blob = Utilities.newBlob(
            Utilities.base64Decode(base64Data),
            'image/jpeg',
            (payload.name || 'foto') + '_' + Date.now() + '.jpg'
        );

        const file = DriveApp.getFolderById(folderId).createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        return ContentService
            .createTextOutput(JSON.stringify({ ok: true, id: file.getId() }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        Logger.log('Erro no upload: ' + err);
        return ContentService
            .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

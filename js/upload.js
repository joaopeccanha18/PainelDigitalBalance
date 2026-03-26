// ─────────────────────────────────────────────────────────────
// CONFIGURAÇÃO — cola o URL do Apps Script após seguir CONFIGURACAO.txt
// ─────────────────────────────────────────────────────────────
const UPLOAD_API_URL = "https://script.google.com/macros/s/AKfycbwz9c1ClR3N8W4hiaQLMJhsV3aJjmVfRbA0eAnBTFf7dFxKvZiDW7q2MG3i9WFqTQWevA/exec";

const CATEGORIES = [
    { key: 'staff',         label: 'Staff',          icon: '👥' },
    { key: 'aulasGrupo',    label: 'Aulas em Grupo', icon: '🏋️' },
    { key: 'espacoBalance', label: 'Espaço Balance', icon: '🌿' },
];

// ─────────────────────────────────────────────────────────────

let selectedCategory = null;
let fileInput, dropZone, preview, previewImg, nameInput, submitBtn, form, successMsg;

document.addEventListener('DOMContentLoaded', () => {
    fileInput  = document.getElementById('file-input');
    dropZone   = document.getElementById('drop-zone');
    preview    = document.getElementById('image-preview');
    previewImg = document.getElementById('preview-img');
    nameInput  = document.getElementById('author-name');
    submitBtn  = document.getElementById('btn-submit');
    form       = document.getElementById('upload-form');
    successMsg = document.getElementById('success-message');

    setupCategories();
    setupFileHandlers();
    setupFormHandler();
});

// ─── Categorias ────────────────────────────────────────────────

function setupCategories() {
    CATEGORIES.forEach(cat => {
        const btn = document.getElementById('cat-' + cat.key);
        if (!btn) return;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedCategory = cat.key;
        });
    });
}

// ─── Ficheiro / Câmara ────────────────────────────────────────

function setupFileHandlers() {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', e => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });
}

function handleFile(file) {
    if (file.type && !file.type.startsWith('image/')) {
        alert('Por favor escolhe uma imagem válida (JPG, PNG, etc.)');
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        previewImg.src = e.target.result;
        preview.classList.add('active');
        dropZone.style.display = 'none';
        preview.onclick = () => fileInput.click();
    };
    reader.readAsDataURL(file);
}

// ─── Formulário & Envio ───────────────────────────────────────

function setupFormHandler() {
    form.addEventListener('submit', async e => {
        e.preventDefault();

        if (!selectedCategory) { alert('Escolhe uma categoria antes de enviar.'); return; }
        if (!fileInput.files[0]) { alert('Seleciona ou tira uma foto primeiro.'); return; }

        submitBtn.disabled  = true;
        submitBtn.innerText = 'A ENVIAR...';

        try {
            const base64 = await compressImage(fileInput.files[0], 1200);
            await fetch(UPLOAD_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    category: selectedCategory,
                    image:    base64,
                    name:     nameInput.value.trim() || 'Anónimo',
                    filename: fileInput.files[0].name || 'foto.jpg',
                }),
                mode: 'no-cors',
            });
            showSuccess();
        } catch (err) {
            alert('Erro ao enviar. Tenta novamente.');
        } finally {
            submitBtn.disabled  = false;
            submitBtn.innerText = 'ENVIAR FOTO';
        }
    });
}

function compressImage(file, maxWidth) {
    return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        const ctx    = canvas.getContext('2d');
        const img    = new Image();
        img.onload = () => {
            let w = img.width, h = img.height;
            if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
            canvas.width = w; canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = URL.createObjectURL(file);
    });
}

function showSuccess() {
    form.style.display = 'none';
    successMsg.classList.add('active');
    setTimeout(() => {
        form.style.display = 'block';
        successMsg.classList.remove('active');
        fileInput.value = '';
        nameInput.value = '';
        preview.classList.remove('active');
        previewImg.src = '';
        dropZone.style.display = 'block';
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
        selectedCategory = null;
    }, 5000);
}

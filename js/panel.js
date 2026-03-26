// ─────────────────────────────────────────────────────────────
// CONFIGURAÇÃO — preenche os URLs após seguir CONFIGURACAO.txt
// ─────────────────────────────────────────────────────────────
const CONFIG = {
    MAPS_API_URL:   "https://script.google.com/macros/s/AKfycbz_UDeRCDGfCLC9XTFzaOgRYenBLxADZ5HsNEGKeC_D4FG992BU6y8zvHnDaUN9UBaI/exec",
    PHOTOS_API_URL: "https://script.google.com/macros/s/AKfycbwz9c1ClR3N8W4hiaQLMJhsV3aJjmVfRbA0eAnBTFf7dFxKvZiDW7q2MG3i9WFqTQWevA/exec",

    MAPS_DURATION: 5 * 60 * 1000, // tempo no modo mapas (ms)
    PHOTO_DURATION: 8000,           // tempo por foto (ms)
    CATEGORY_TRANSITION_DURATION: 2000,           // ecrã de transição entre categorias (ms)
    PHOTOS_REFRESH_INTERVAL: 10 * 60 * 1000, // refresh das fotos em background (ms)

    CATEGORIES: [
        { key: 'staff', label: 'Staff', icon: '👥' },
        { key: 'aulasGrupo', label: 'Aulas em Grupo', icon: '🏋️' },
        { key: 'espacoBalance', label: 'Espaço Balance', icon: '🌿' },
    ],
};

// ─────────────────────────────────────────────────────────────

let photosData = { staff: [], aulasGrupo: [], espacoBalance: [] };
let modeTimer = null;
let currentMode = 'maps';

const carouselOverlay = document.getElementById('carousel-overlay');
const categoryName = document.getElementById('category-name');
const categoryIcon = document.getElementById('category-icon');
const categoryDots = document.getElementById('category-dots');
const carouselPhotoArea = document.getElementById('carousel-photo-area');
const categoryTransition = document.getElementById('category-transition');
const transitionIcon = document.getElementById('transition-icon');
const transitionLabel = document.getElementById('transition-label');
const photoProgressBar = document.getElementById('photo-progress-bar');
const cycleBar = document.getElementById('cycle-bar');

// ─── Utilitários ──────────────────────────────────────────────

function setStatus(ok) {
    const dot = document.getElementById('status-dot');
    if (dot) dot.className = ok ? 'status-dot' : 'status-dot error';
}

function toDrivePreview(url) {
    if (url.includes('/view')) url = url.replace('/view', '/preview');
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && !url.includes('/preview'))
        url = 'https://drive.google.com/file/d/' + match[1] + '/preview';
    if (url.includes('drive.google.com'))
        url += (url.includes('?') ? '&' : '?') + 'rm=minimal';
    return url;
}

function cleanName(name) {
    return (name || 'Balance').replace(/_\d+$/, '');
}

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ─── Relógio & Saudação ────────────────────────────────────────

function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('pt-PT');
    const h = now.getHours();
    let g = 'Bom Dia';
    if (h >= 12 && h < 19) g = 'Boa Tarde';
    else if (h >= 19 || h < 5) g = 'Boa Noite';
    document.getElementById('greeting').innerText = g;
}

// ─── Meteorologia ─────────────────────────────────────────────

async function updateWeather() {
    try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=40.6133&longitude=-8.6472&current_weather=true");
        const d = await res.json();
        const temp = Math.round(d.current_weather.temperature);
        const code = d.current_weather.weathercode;
        let icon = '🌡️';
        if (code === 0) icon = '☀️';
        else if (code >= 1 && code <= 3) icon = '⛅';
        else if (code >= 45 && code <= 48) icon = '🌫️';
        else if (code >= 51 && code <= 67) icon = '🌧️';
        else if (code >= 71 && code <= 77) icon = '❄️';
        else if (code >= 95 && code <= 99) icon = '⛈️';
        document.getElementById('weather').innerText = `${icon} ${temp}°C`;
    } catch (e) { }
}

// ─── Fetch Mapas de Aulas ─────────────────────────────────────

async function fetchMaps() {
    try {
        const data = await fetch(CONFIG.MAPS_API_URL).then(r => r.json());
        const ts = Date.now();
        const ip = document.getElementById('iframe-piscina');
        const ig = document.getElementById('iframe-ginasio');
        if (data.piscina && data.piscina.includes('http')) {
            const u = toDrivePreview(data.piscina) + '?v=' + ts;
            if (ip.src !== u) ip.src = u;
        }
        if (data.ginasio && data.ginasio.includes('http')) {
            const u = toDrivePreview(data.ginasio) + '?v=' + ts;
            if (ig.src !== u) ig.src = u;
        }
    } catch (e) { console.error('Erro mapas:', e); }
}

// ─── Fetch Fotos (3 categorias) ───────────────────────────────

async function fetchPhotos() {
    if (CONFIG.PHOTOS_API_URL.startsWith('COLE')) return;
    try {
        const data = await fetch(CONFIG.PHOTOS_API_URL).then(r => r.json());
        if (data.staff) photosData.staff = data.staff;
        if (data.aulasGrupo) photosData.aulasGrupo = data.aulasGrupo;
        if (data.espacoBalance) photosData.espacoBalance = data.espacoBalance;
        setStatus(true);
    } catch (e) {
        setStatus(false);
    }
}

// ─── Barra de Progresso ───────────────────────────────────────

function animateBar(el, duration) {
    if (!el) return;
    el.style.transition = 'none';
    el.style.width = '0%';
    void el.offsetWidth;
    el.style.transition = `width ${duration}ms linear`;
    el.style.width = '100%';
}

// ─── Ciclo Principal: Mapas ↔ Carrossel ───────────────────────

function startMapsMode() {
    currentMode = 'maps';
    carouselOverlay.classList.remove('active');
    animateBar(cycleBar, CONFIG.MAPS_DURATION);
    clearTimeout(modeTimer);
    modeTimer = setTimeout(startCarouselMode, CONFIG.MAPS_DURATION);
}

async function startCarouselMode() {
    currentMode = 'carousel';
    carouselOverlay.classList.add('active');
    renderDots(-1);

    const totalDuration = CONFIG.CATEGORIES.reduce((acc, cat) => {
        const count = (photosData[cat.key] || []).length || 1;
        return acc + count * CONFIG.PHOTO_DURATION + CONFIG.CATEGORY_TRANSITION_DURATION;
    }, 0);
    animateBar(cycleBar, totalDuration);

    for (let i = 0; i < CONFIG.CATEGORIES.length; i++) {
        if (currentMode !== 'carousel') return;
        await showCategory(i);
    }

    startMapsMode();
}

// ─── Carrossel: exibição de categoria ─────────────────────────

function showCategory(catIndex) {
    return new Promise(async resolve => {
        const cat = CONFIG.CATEGORIES[catIndex];
        const photos = photosData[cat.key] || [];

        await showTransition(cat);
        if (currentMode !== 'carousel') { resolve(); return; }

        if (categoryIcon) categoryIcon.textContent = cat.icon;
        if (categoryName) categoryName.textContent = cat.label;
        renderDots(catIndex);

        if (photos.length === 0) {
            carouselPhotoArea.innerHTML = `
                <div class="carousel-empty">
                    <div class="empty-icon">${cat.icon}</div>
                    <div>Sem fotos em ${cat.label}</div>
                </div>`;
            await wait(CONFIG.PHOTO_DURATION * 2);
            resolve();
            return;
        }

        for (const photo of photos) {
            if (currentMode !== 'carousel') { resolve(); return; }
            await showPhoto(photo);
        }
        resolve();
    });
}

function showTransition(cat) {
    return new Promise(resolve => {
        if (transitionIcon) transitionIcon.textContent = cat.icon;
        if (transitionLabel) transitionLabel.textContent = cat.label;
        categoryTransition.classList.add('show');
        setTimeout(() => {
            categoryTransition.classList.remove('show');
            setTimeout(resolve, 500);
        }, CONFIG.CATEGORY_TRANSITION_DURATION);
    });
}

function showPhoto(photo) {
    return new Promise(resolve => {
        carouselPhotoArea.innerHTML = '';

        const div = document.createElement('div');
        div.className = 'carousel-photo';

        const img = document.createElement('img');
        img.src = `https://lh3.googleusercontent.com/d/${photo.id}=w1600`;
        img.alt = cleanName(photo.name);
        img.referrerPolicy = 'no-referrer';
        img.onerror = () => {
            div.innerHTML = '<div class="carousel-empty"><div class="empty-icon">📷</div><div>Foto indisponível</div></div>';
        };

        const caption = document.createElement('div');
        caption.className = 'photo-caption';
        caption.textContent = cleanName(photo.name);

        div.appendChild(img);
        div.appendChild(caption);
        carouselPhotoArea.appendChild(div);

        requestAnimationFrame(() => requestAnimationFrame(() => div.classList.add('visible')));
        animateBar(photoProgressBar, CONFIG.PHOTO_DURATION);
        setTimeout(resolve, CONFIG.PHOTO_DURATION);
    });
}

function renderDots(activeIndex) {
    if (!categoryDots) return;
    categoryDots.innerHTML = CONFIG.CATEGORIES.map((_, i) =>
        `<div class="category-dot ${i === activeIndex ? 'active' : ''}"></div>`
    ).join('');
}

// ─── Init ─────────────────────────────────────────────────────

async function init() {
    updateClock();
    setInterval(updateClock, 1000);

    updateWeather();
    setInterval(updateWeather, 30 * 60 * 1000);

    await fetchMaps();
    setInterval(fetchMaps, 24 * 60 * 60 * 1000);

    await fetchPhotos();
    setInterval(fetchPhotos, CONFIG.PHOTOS_REFRESH_INTERVAL);

    startMapsMode();
}

document.addEventListener('DOMContentLoaded', init);

<p align="center">
  <img src="assets/newlogobc_white.png" alt="Balance Fitness Club" width="280">
</p>

<h1 align="center">Painel Digital Balance</h1>

<p align="center">
  <strong>Sistema Dinâmico para TV — Mapas de Aulas + Carrossel de Fotos</strong>
</p>

<p align="center">
  <a href="https://joaopeccanha18.github.io/PainelDigitalBalance/" target="_blank">
    <img src="https://img.shields.io/badge/Aceder_ao_Painel-000000?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Painel URL">
  </a>
  <a href="https://joaopeccanha18.github.io/PainelDigitalBalance/upload.html" target="_blank">
    <img src="https://img.shields.io/badge/Upload_de_Fotos-212121?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Upload URL">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Google%20Apps%20Script-34A853?style=flat-square&logo=google&logoColor=white" alt="Google Apps Script">
</p>

---

## 🎯 Sobre o Projeto

O **Painel Digital Balance** é uma aplicação web autônoma pensada para ser exibida continuamente num ecrã/TV no ginásio **Balance Fitness Club**. 
Opera em ciclo contínuo, dividindo o tempo entre a exibição dos **Mapas de Aulas (PDFs)** e um **Carrossel de Fotos** partilhado por colaboradores e alunos.

---

## 🔗 Links de Produção

- 📺 **Painel para TV:** [joaopeccanha18.github.io/PainelDigitalBalance](https://joaopeccanha18.github.io/PainelDigitalBalance/)
- 📱 **Enviar Fotos (Mobile):** [joaopeccanha18.github.io/PainelDigitalBalance/upload.html](https://joaopeccanha18.github.io/PainelDigitalBalance/upload.html)

---

## ✨ Funcionalidades

### 📺 Painel Principal (TV)
* **Auto-Cycling:** Alterna automaticamente entre Modo Mapas (5 min) e Modo Carrossel de Fotos.
* **Modo Mapas:** Exibe 2 mapas de aulas (Piscina + Ginásio) oriundos do Google Drive.
* **Modo Carrossel:** Exibe dinamicamente fotos divididas em 3 categorias organizadas: *Staff*, *Aulas em Grupo*, e *Espaço Balance*.
* **Header Inteligente:** Meteorologia em tempo real (Open-Meteo), Relógio dinâmico e Saudação automática conforme a hora do dia.

### 📱 Upload de Fotos (Mobile)
* **Progressive Web App Style:** Interface otimizada para telemóveis.
* **Captura:** Tirar foto diretamente da câmara ou escolher da galeria.
* **Otimização:** Compressão local das imagens (max. 1200px) antes do upload para poupar largura de banda.
* **Upload Direto:** As fotos vão diretamente do telemóvel para as pastas específicas no Google Drive da instituição.

---

## 🛠️ Arquitetura Google Workspace

A aplicação funciona "serverless", utilizando o Google Drive como base de dados e CDN:

1. **Mapas de Aulas (`MapsCode.gs`)**: 
   Busca o PDF mais recente das pastas "Piscina" e "Aulas em Grupo".
2. **Galeria de Fotos (`Code.gs`)**: 
   - **GET**: Devolve as fotos aprovadas das pastas *Staff*, *Aulas em Grupo* e *Espaço Balance*.
   - **POST**: Recebe as imagens do telemóvel via `upload.html` e guarda-as diretamente na pasta respetiva.

---

## 📁 Estrutura do Projeto

```text
PainelDigitalBalance/
├── index.html                 # Painel principal para a TV
├── upload.html                # App mobile para envio de fotos
├── CONFIGURACAO.txt           # Guia de setup do Google Drive
├── css/
│   └── style.css              # Estilos UI (Dark Theme Premium)
├── js/
│   ├── panel.js               # Lógica de rotação e fetch do painel
│   └── upload.js              # Lógica de captura e compressão de fotos
├── apps-script/
│   ├── MapsCode.gs            # Script do Backend (Mapas)
│   └── Code.gs                # Script do Backend (Fotos/Upload)
└── assets/
    └── newlogobc_white.png    # Logotipo
```

---

## 🎨 Design System

- **Tema**: All Black Premium (`#0A0A0A` de fundo)
- **Acentuação**: Cinzas escuros (`#1f1f1f`) para cartões de mapas
- **Transições**: Fade-ins lentos para não distrair (`transition: opacity 1.2s`)
- **Acessibilidade**: Indicadores visuais do tempo de vida de cada foto no carrossel.

---

<p align="center">
  Feito com 🖤 para o <strong>Balance Fitness Club</strong> — Verdemilho, Aradas, Aveiro
</p>

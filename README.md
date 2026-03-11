<div align="center">

<svg width="800" height="140" viewBox="0 0 800 140" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117"/>
      <stop offset="60%" style="stop-color:#0d1a0f"/>
      <stop offset="100%" style="stop-color:#0a1628"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="800" height="140" fill="url(#bg)" rx="10"/>
  <polygon points="0,140 100,70 180,100 270,45 360,80 450,30 540,65 630,35 720,70 800,45 800,140" fill="#0a1a0d" opacity="0.85"/>
  <polygon points="0,140 90,95 190,115 290,65 390,95 490,55 590,80 690,55 790,85 800,70 800,140" fill="#0d1f10" opacity="0.5"/>
  <line x1="0" y1="139" x2="800" y2="139" stroke="#21262d" stroke-width="1"/>
  <text x="400" y="62" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" fill="#3fb950" opacity="0.7" filter="url(#glow)">harshwardhan1507 / SRM-cgpa-calculator</text>
  <text x="400" y="92" text-anchor="middle" font-family="'Courier New',monospace" font-size="24" font-weight="700" fill="#ffffff" filter="url(#glow)">🎓 SRM CGPA Calculator</text>
  <text x="400" y="116" text-anchor="middle" font-family="'Courier New',monospace" font-size="12" fill="#3fb950" filter="url(#glow)">HTML · CSS · JavaScript · Firebase · Vercel</text>
</svg>

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-srm--cgpa--calculator--by--haruto.vercel.app-0d1117?style=for-the-badge&logo=vercel&logoColor=3fb950&labelColor=0d1117)](https://srm-cgpa-calculator-by-haruto.vercel.app/)

[![HTML](https://img.shields.io/badge/HTML5-0d1117?style=flat-square&logo=html5&logoColor=E34F26)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS3-0d1117?style=flat-square&logo=css3&logoColor=1572B6)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-0d1117?style=flat-square&logo=javascript&logoColor=F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Firebase](https://img.shields.io/badge/Firebase-0d1117?style=flat-square&logo=firebase&logoColor=FFCA28)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Vercel-0d1117?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## 📖 Overview

A fast, accurate, and lightweight **GPA & CGPA calculator** built specifically for **SRM University students**. Enter your subjects, credits, and grades — get your semester GPA and cumulative CGPA instantly. All calculations run client-side with zero page reloads, backed by Firebase for future feature expansion.

---

## ✨ Features

- 🧮 **Semester GPA** — calculate grade point average for any single semester
- 📈 **Cumulative CGPA** — track your CGPA across multiple semesters
- 🎓 **SRM Grading System** — logic aligned with SRM University's credit-weighted grading
- ⚡ **Instant Results** — all computation happens client-side, no server round trips
- 💻 **Clean Responsive UI** — works smoothly on desktop and mobile
- 🔥 **Firebase Ready** — authentication and Firestore database scaffolded for future features
- 🌐 **Deployed on Vercel** — always live, always fast

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| HTML5 | Structure & markup |
| CSS3 | Styling & responsive layout |
| JavaScript (Vanilla) | GPA/CGPA calculation logic |
| Firebase | Auth & database foundation |
| Vercel | Deployment & hosting |

---

## 📐 How It Works

```
User Input
    │
    ├── Number of subjects
    ├── Credits per subject
    └── Grade per subject
            │
            ▼
    Grade → Grade Points
    (SRM grading scale)
            │
            ▼
    Credit-Weighted Average
    Σ(Credits × Grade Points) / Σ(Credits)
            │
            ▼
    GPA / CGPA  ✅
```

All calculations are performed on the **client side** — no data is sent to any server during computation.

---

## 📂 Project Structure

```
SRM-cgpa-calculator/
│
├── index.html          # Main UI — inputs, results display
├── styles.css          # Styling & responsive layout
├── script.js           # Core GPA/CGPA calculation logic
│
├── firebase-init.js    # Firebase app initialization & config
├── firebase-service.js # Firebase auth & Firestore service layer
│
└── README.md
```

---

## 🎓 SRM Grading Scale

| Grade | Grade Points |
|-------|-------------|
| O | 10 |
| A+ | 9 |
| A | 8 |
| B+ | 7 |
| B | 6 |
| C | 5 |
| F | 0 |

> GPA = Σ(Credit × Grade Point) ÷ Σ(Credits)

---

## 🔥 Firebase Integration

Firebase is scaffolded and ready for these upcoming features:

- 🔐 Google Sign-In via Firebase Authentication
- 💾 Save semester-wise GPA history to Firestore
- 📊 CGPA trend charts over semesters
- 👤 Personal student dashboard

> The calculator currently works **fully offline** — Firebase is optional and doesn't affect core functionality.

---

## 🚀 Getting Started

No build tools needed — just open in browser.

```bash
# Clone the repo
git clone https://github.com/harshwardhan1507/SRM-cgpa-calculator.git

# Navigate into the project
cd SRM-cgpa-calculator

# Open directly in browser
open index.html
```

Or just visit the **[Live Demo ↗](https://srm-cgpa-calculator-by-haruto.vercel.app/)** directly.

---

## 🗺️ Roadmap

- [x] Semester GPA calculation
- [x] Cumulative CGPA calculation
- [x] Firebase project setup
- [ ] Google Login via Firebase Auth
- [ ] Save & load semester data from Firestore
- [ ] CGPA trend visualization (chart)
- [ ] CGPA to percentage converter
- [ ] Improved mobile UX

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
# Fork → clone → create branch → commit → push → open PR
git checkout -b feature/your-feature-name
```

---

## ⚠️ Disclaimer

This calculator follows commonly used SRM grading patterns. For official academic purposes, always refer to **SRM University's academic regulations**.

---

## 👨‍💻 Author

**Harsh Wardhan**
- 🌐 [Portfolio](https://harshwardhanportfolio.vercel.app/)
- 💼 [LinkedIn](https://www.linkedin.com/in/harsh-wardhan-singh-cse/)
- 🐙 [GitHub](https://github.com/harshwardhan1507)

If this helped you, drop a ⭐ on the repo — it means a lot!

---

<div align="center">

Built with 💚 for SRM students · © 2026 Harsh Wardhan

![](https://komarev.com/ghpvc/?username=harshwardhan1507&color=3fb950&style=flat-square&label=REPO+VIEWS)

</div>

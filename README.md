# SRM CGPA Calculator

A simple, fast, and accurate **CGPA & GPA calculator** built specifically for **SRM University students**.  
The project is designed to be lightweight, beginner-friendly, and scalable, with optional Firebase integration for future backend features.

🔗 **Live Demo:** https://srm-cgpa-calculator-by-haruto.vercel.app

---

## 🚀 Features

- 📊 Calculate **GPA** for a single semester  
- 📈 Calculate **CGPA** across multiple semesters  
- 🎓 Logic aligned with **SRM University grading system**  
- ⚡ Instant client-side calculations  
- 💻 Clean and responsive UI  
- 🔐 Firebase setup included for future authentication & data storage  
- 🌐 Deployed on **Vercel**

---

## 🛠️ Tech Stack

- **HTML5** – Markup  
- **CSS3** – Styling & layout  
- **JavaScript (Vanilla)** – Calculation logic  
- **Firebase** – Backend foundation (Auth / Database ready)  
- **Vercel** – Deployment & hosting  

---

## 📐 How the Calculator Works

1. User enters:
   - Number of subjects
   - Credits per subject
   - Corresponding grades
2. Grades are converted into grade points
3. A **credit-weighted average** is calculated
4. Final **GPA / CGPA** is displayed instantly

All calculations are performed on the client side for speed and simplicity.

---

## 📂 Project Structure
```text
srm-cgpa-calculator/
│
├── index.html # Main HTML file
├── style.css # Global styles
├── script.js # CGPA/GPA calculation logic
│
├── firebase-init.js # Firebase initialization & configuration
├── firebase-service.js # Firebase services (auth, database logic)
│
└── README.md # Project documentation
```

---

## 🔥 Firebase Integration

Firebase is included to support future features such as:

- Google account authentication  
- Saving semester-wise GPA/CGPA data  
- User-specific dashboards  
- Cloud database support  

Currently, the calculator works **independently of Firebase**, ensuring reliability even without login.

---

## ⚠️ Accuracy Disclaimer

This calculator follows commonly used SRM grading patterns.  
For official academic purposes, always refer to **SRM University’s academic regulations**.

---

## 📌 Planned Enhancements

- 🔐 Google Login using Firebase Authentication  
- 💾 Store semester data in Firebase Firestore  
- 📊 CGPA trend visualization  
- 📱 Improved mobile UX  
- 🧮 CGPA to percentage conversion  

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository  
2. Create a new feature branch  
3. Commit your changes  
4. Open a pull request  

---

## 👨‍💻 Author

**Harsh Wardhan**  
Engineering Student | Web Development Enthusiast  

If you find this project useful, consider giving it a ⭐ on GitHub.

---

## 📄 License

This project is licensed under the **MIT License**.

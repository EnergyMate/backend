# ⚡ EnergyMate — Backend

[Live demo ➜ energymate.github.io/backend](https://energymate.github.io/backend)  
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![Node.js](https://img.shields.io/badge/stack-Node.js-green)

✨ Singkatnya: backend ini menyediakan API untuk prediksi konsumsi energi, integrasi AI chatbot, dan estimasi tagihan listrik—menggabungkan model ML (TensorFlow.js) dengan layanan eksternal untuk pengalaman demo interaktif.

**Kenapa penting?**
- Membantu pengguna memahami & mengurangi konsumsi listrik rumah tangga.
- Menjadikan model ML yang dilatih dapat diakses lewat API dan demo web.

**Fitur Utama**
- 🔮 Prediksi konsumsi energi (TensorFlow.js model di `public/model`)
- 🤖 Chatbot energi (wrapper AI di `services/geminiService.js`)
- 🧾 Estimasi tagihan dan breakdown per sub-metering
- 🔒 Autentikasi user dengan JWT dan penyimpanan riwayat prediksi

---

**🔍 How it works (ringkas & interaktif)**
1. Client/Frontend memanggil endpoint pada `routes/` (mis. `predictionRoutes.js`).
2. `controllers/` melakukan validasi + preprocessing (scaler).
3. Jika perlu, model TensorFlow.js di `public/model` dipanggil untuk inferensi.
4. Hasil diproses, diklasifikasikan (Rendah/Sedang/Tinggi), disimpan via `models/`, dan dikembalikan ke client.

Contoh alur singkat:
`Client → POST /api/prediction → predictionController → model (public/model) → DB (predictionHistory) → Response`

---

**📁 Struktur Singkat (highlight)**
- `server.js` — entry point
- `config/db.js` — koneksi MongoDB
- `controllers/` — `predictionController.js`, `chatbotController.js`, `userController.js`
- `routes/` — definisi route untuk API
- `middleware/` — `authMiddleware.js` (JWT)
- `models/` — `userModel.js`, `predictionHistoryModel.js`
- `services/geminiService.js` — integrasi AI
- `public/model/` — `model.json`, `X_scaler.json`, `y_scaler.json`

---

**🔌 Contoh singkat request (demo / untuk coba cepat)**
Gunakan header `Authorization: Bearer <TOKEN>` untuk route yang protected.

Contoh `curl` (prediksi — contoh format minimal):

```bash
curl -X POST "https://<your-backend>/api/prediction" \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <JWT>" \
	-d '{"sub_metering_1": 0.5, "sub_metering_2": 0.3, "sub_metering_3": 0.7, "hour": 14}'
```

Contoh `curl` (chatbot):

```bash
curl -X POST "https://<your-backend>/api/chatbot" \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <JWT>" \
	-d '{"message": "Bagaimana cara menurunkan tagihan listrik saya?"}'
```

> Tip: lihat `routes/` untuk path pasti dan `controllers/` untuk struktur payload.

---

**🧠 Integrasi ML & Model**
- Model utama (LSTM) dilatih di folder `ML/` lalu dikonversi ke TensorFlow.js dan disimpan di `public/model`.
- File scaler (`X_scaler.json`, `y_scaler.json`) digunakan untuk normalisasi input/output — pastikan controller memuat dan menerapkan scaler yang sama.

---

**🔐 Keamanan & Environment**
- Jangan commit secret/API keys. Gunakan environment variables pada server produksi.
- Variabel penting (harus ada di environment server):
	- `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `IAK_API_KEY`, `PORT`

---

**🙋 Untuk Pengunjung GitHub Pages**
- Klik demo: https://energymate.github.io/backend untuk melihat antarmuka demo yang memanggil API.
- Ingin melihat model? buka `public/model/model.json` langsung di repo atau melalui demo.

---

**🛠 Untuk Pengembang / Reviewer**
- Periksa `routes/` dan `controllers/` untuk memahami endpoint dan payload.
- Periksa `services/geminiService.js` untuk detail integrasi AI.

**License**: MIT

---

Made with ❤️ by EnergyMate
// -----------------------------------------------------------------------------
// EnergyMate Backend - server.js (Main Entry Point)
// -----------------------------------------------------------------------------
// Deskripsi: File ini adalah titik masuk utama untuk aplikasi backend.
// Tugasnya adalah menginisialisasi Express, menghubungkan ke database,
// menerapkan middleware, dan me-mount router utama.
// -----------------------------------------------------------------------------

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// --- 1. INITIALIZE APP & CONNECT TO DB ---
const app = express();
connectDB();

// --- 2. MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- 3. API ROUTES ---
app.get('/', (req, res) => {
    res.send('EnergyMate API is running...');
});

// Gunakan routers yang sudah dipisahkan
app.use('/api/auth', userRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/chatbot', chatbotRoutes);

// --- 4. START SERVER ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

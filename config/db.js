// -----------------------------------------------------------------------------
// Konfigurasi Koneksi Database (MongoDB)
// -----------------------------------------------------------------------------

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host + " - " + conn.connection.name}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Keluar dari proses jika koneksi gagal
    }
};

module.exports = connectDB;

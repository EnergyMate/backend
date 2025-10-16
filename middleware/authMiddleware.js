// -----------------------------------------------------------------------------
// Middleware untuk Otentikasi & Proteksi Rute
// -----------------------------------------------------------------------------

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware untuk melindungi route (memerlukan token)
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil token dari header
            token = req.headers.authorization.split(' ')[1];

            // Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Ambil data user dari ID di token, tanpa password
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next(); // Lanjut ke controller berikutnya
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };

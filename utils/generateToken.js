// -----------------------------------------------------------------------------
// Utilitas untuk Membuat JSON Web Token (JWT)
// -----------------------------------------------------------------------------

const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = generateToken;

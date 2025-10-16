// -----------------------------------------------------------------------------
// Rute untuk Endpoint Prediksi (Updated)
// -----------------------------------------------------------------------------

const express = require('express');
const {
    getAppliancePredictionFlask,
    getAppliancePredictionTfjs, // Impor controller baru
    getBillingEstimation,
    getPredictionHistory
} = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// [LAMA] Endpoint ke backend Flask
router.post('/appliances', getAppliancePredictionFlask);

// [BARU] Endpoint untuk model TF.js lokal
router.post('/appliances/tfjs', getAppliancePredictionTfjs);

// Endpoint lain tetap sama
router.post('/billing', protect, getBillingEstimation);
router.get('/history', protect, getPredictionHistory);

module.exports = router;

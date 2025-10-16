// -----------------------------------------------------------------------------
// Mongoose Model untuk PredictionHistory
// -----------------------------------------------------------------------------

const mongoose = require('mongoose');

// Skema untuk Riwayat Prediksi
const predictionHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inputType: { type: String, enum: ['appliances', 'pln_bill'], required: true },
    inputData: { type: Object, required: true },
    predictionResult: { type: Object, required: true },
    estimatedCost: { type: Number, required: false },
}, { timestamps: true });

const PredictionHistory = mongoose.model('PredictionHistory', predictionHistorySchema);

module.exports = PredictionHistory;

// -----------------------------------------------------------------------------
// Controller untuk Logika Prediksi Energi (Updated with TFJS-WASM)
// -----------------------------------------------------------------------------
const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const PredictionHistory = require('../models/predictionHistoryModel');
const User = require('../models/userModel');
const { generateGeminiResponse } = require('../services/geminiService');

// --- TF.js Setup (CPU Backend) ---
const tf = require('@tensorflow/tfjs');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

// --- Environment Variables ---
const MODEL_BASE_URL = process.env.MODEL_BASE_URL; // contoh: http://localhost:5001/model
let model, X_scaler, y_scaler;

(async () => {
    try {
        console.log('Using TensorFlow.js backend: cpu...');
        await tf.setBackend('cpu');  // 💡 Ganti wasm -> cpu
        await tf.ready();
        console.log(`✅ Active backend: ${tf.getBackend()}`);

        // Pastikan ENV sudah diatur
        if (!MODEL_BASE_URL) {
        throw new Error('❌ MODEL_BASE_URL is not defined in .env');
        }

        console.log('Loading TF.js model and scalers from:', MODEL_BASE_URL);

        // Load model dan scaler dari URL .env
        model = await tf.loadLayersModel(`${MODEL_BASE_URL}/model.json`);
        X_scaler = await fetch(`${MODEL_BASE_URL}/X_scaler.json`).then((res) => res.json());
        y_scaler = await fetch(`${MODEL_BASE_URL}/y_scaler.json`).then((res) => res.json());

        console.log('✅ TF.js model and scalers loaded successfully.');
    } catch (error) {
        console.error('❌ Failed to load TF.js model with CPU backend:', error);
        model = null; // Disable model if failed to load
    }
})();

// --- Helper & Constant Definitions ---
const TARIFFS = { '900 VA': 1352.00, '1300 VA': 1444.70, '2200 VA': 1444.70, '3500 VA': 1699.53, '5500 VA': 1699.53 };
const DEFAULT_TARIFF = 1444.70;
const SUB_LABELS = {
    "Sub_metering_1": "Peralatan Dapur & Elektronik Kecil",
    "Sub_metering_2": "Peralatan Laundry & Pemanas",
    "Sub_metering_3": "Pendingin, Penerangan & Pembersih"
};
const Q1 = 2.50, Q3 = 5.00; // Kuartil untuk kategori

async function checkPlnBill(customerId) {
    const username = process.env.IAK_USERNAME, apiKey = process.env.IAK_API_KEY;
    const ref_id = `energymate-${Date.now()}`;
    const sign = crypto.createHash('md5').update(username + apiKey + ref_id).digest('hex');
    try {
        const response = await axios.post('https://testpostpaid.mobilepulsa.net/api/v1/bill/check', { commands: "inq-pasca", username, code: "PLNPOSTPAID", hp: customerId, ref_id, sign });
        return (response.data?.data?.response_code === "00") ? { success: true, data: response.data.data } : { success: false, message: response.data?.data?.message || "Error from IAK" };
    } catch (error) {
        return { success: false, message: "Failed to connect to IAK API." };
    }
}

// --- Controller Functions ---

/**
 * @desc    [TFJS] Get prediction using local TFJS model.
 * @route   POST /api/predict/appliances/tfjs
 * @access  Public (Optional Auth)
 */
const getAppliancePredictionTfjs = async (req, res) => {
    if (!model) {
        return res.status(503).json({ message: "TF.js model is not available or failed to load." });
    }

    const { Sub_metering_1, Sub_metering_2, Sub_metering_3, hour, userPower } = req.body;
    if (Sub_metering_1 == null || Sub_metering_2 == null || Sub_metering_3 == null || hour == null) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        // 1. Preprocessing & Prediction
        const total_kw = Sub_metering_1 + Sub_metering_2 + Sub_metering_3;
        const global_intensity = (total_kw * 1000) / 230;

        const inputData = [global_intensity, Sub_metering_1, Sub_metering_2, Sub_metering_3, hour];

        // Scale input data menggunakan min_ + scale_ karena mean_ null
        const scaledInput = inputData.map((val, i) => (val - X_scaler.min_[i]) / X_scaler.scale_[i]);

        // Reshape untuk model (1, 60, 5)
        const past_60_input = Array(60).fill(scaledInput);
        const inputTensor = tf.tensor3d([past_60_input]);

        const prediction = model.predict(inputTensor);
        const pred_scaled = await prediction.data();
        tf.dispose([inputTensor, prediction]);

        // Inverse transform prediction menggunakan min_ + scale_
        const prediction_kw = (pred_scaled[0] * y_scaler.scale_[0]) + y_scaler.min_[0];

        // 2. Recommendation Logic
        const category = prediction_kw < Q1 ? "Rendah" : prediction_kw <= Q3 ? "Sedang" : "Tinggi";
        const usage_kws = { Sub_metering_1, Sub_metering_2, Sub_metering_3 };
        const max_sub = Object.keys(usage_kws).reduce((a, b) => usage_kws[a] > usage_kws[b] ? a : b);
        const focus_area = SUB_LABELS[max_sub];

        // 3. Generate recommendation dengan Gemini
        const breakdown_text = Object.entries(usage_kws)
            .map(([k, v]) => `- ${SUB_LABELS[k]}: ${v.toFixed(2)} kWh`).join('\n');

        const llm_prompt = `Berdasarkan data berikut, berikan 3 rekomendasi spesifik untuk hemat energi:\n1. Kategori Konsumsi: ${category} (Prediksi: ${prediction_kw.toFixed(2)} kWh).\n2. Area Beban Tertinggi: ${focus_area}.\n3. Rincian Penggunaan:\n${breakdown_text}`;
        const systemInstruction = "Anda adalah ahli efisiensi energi. Berikan saran hemat energi yang sangat spesifik namun tetap ringkas, terperinci, dan berorientasi tindakan dalam BAHASA INDONESIA, berdasarkan data konsumsi. Jawab hanya dengan rekomendasi spesifik (maksimal 3 poin).";

        const specific_recommendation = await generateGeminiResponse(systemInstruction, llm_prompt);

        // 4. Final Result Assembly
        let estimated_monthly_cost = null;
        if (userPower && prediction_kw > 0) {
            const powerKey = Object.keys(TARIFFS).find(k => userPower.includes(k.split(' ')[0]));
            const tariff = powerKey ? TARIFFS[powerKey] : DEFAULT_TARIFF;
            estimated_monthly_cost = prediction_kw * 24 * 30 * tariff;
        }

        const result = {
            prediction_kw: parseFloat(prediction_kw.toFixed(2)),
            category,
            focus_area,
            specific_recommendation,
            estimated_monthly_cost,
            breakdown: Object.fromEntries(Object.entries(usage_kws)
                .map(([k, v]) => [SUB_LABELS[k], v.toFixed(2)]))
        };

        // Optional: Save ke history
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (await User.findById(decoded.id)) {
                    await PredictionHistory.create({
                        userId: decoded.id,
                        inputType: 'appliances',
                        inputData: req.body,
                        predictionResult: result,
                        estimatedCost: estimated_monthly_cost
                    });
                }
            } catch (e) { /* Abaikan jika token tidak valid */ }
        }

        res.json(result);
    } catch (error) {
        console.error("TF.js Prediction Error:", error);
        res.status(500).json({ message: "Error during TF.js prediction." });
    }
};

/**
 * @desc    [Flask] Get prediction based on appliance usage.
 * @route   POST /api/predict/appliances
 * @access  Public (Optional Auth)
 */
const getAppliancePredictionFlask = async (req, res) => {
    const { Sub_metering_1, Sub_metering_2, Sub_metering_3, hour, userPower } = req.body;
    
    if (Sub_metering_1 == null || Sub_metering_2 == null || Sub_metering_3 == null || hour == null) {
        return res.status(400).json({ message: 'Missing required fields for appliance prediction.' });
    }
    
    try {
        const flaskApiUrl = process.env.FLASK_API_URL || 'http://localhost:8080/api/predict';
        const predictionResponse = await axios.post(flaskApiUrl, { Sub_metering_1, Sub_metering_2, Sub_metering_3, hour });
        const result = predictionResponse.data;
        
        let estimated_monthly_cost = null;
        if (userPower && result.prediction_kw > 0) {
            const powerKey = Object.keys(TARIFFS).find(k => userPower.includes(k.split(' ')[0]));
            const tariff = powerKey ? TARIFFS[powerKey] : DEFAULT_TARIFF;
            estimated_monthly_cost = result.prediction_kw * 24 * 30 * tariff;
            result.estimated_monthly_cost = estimated_monthly_cost;
        }
        
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if(await User.findById(decoded.id)) {
                    await PredictionHistory.create({ userId: decoded.id, inputType: 'appliances', inputData: req.body, predictionResult: result, estimatedCost: estimated_monthly_cost });
                }
            } catch(e) { /* Abaikan jika token tidak valid */ }
        }
        
        res.json(result);
    } catch (error) {
        console.error("Flask API call error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Error getting prediction from model." });
    }
};

const getBillingEstimation = async (req, res) => {
    const { plnCustomerId } = req.body;
    if (!plnCustomerId) {
        return res.status(400).json({ message: "PLN Customer ID is required." });
    }
    try {
        const billInfo = await checkPlnBill(plnCustomerId);
        if (!billInfo.success) {
            return res.status(400).json({ message: `Failed to get bill info: ${billInfo.message}` });
        }
        const billData = billInfo.data;
        const result = {
            billing_data: { customerName: billData.tr_name, period: billData.period, power: `${billData.desc.daya} VA`, totalBill: billData.price },
        };
        await PredictionHistory.create({ userId: req.user._id, inputType: 'pln_bill', inputData: { plnCustomerId }, predictionResult: result, estimatedCost: billData.price });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getPredictionHistory = async (req, res) => {
    try {
        const history = await PredictionHistory.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getAppliancePredictionFlask,
    getAppliancePredictionTfjs,
    getBillingEstimation,
    getPredictionHistory
};

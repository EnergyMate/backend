// -----------------------------------------------------------------------------
// Gemini LLM Service
// Deskripsi: Modul terpusat untuk berinteraksi dengan Google Gemini API.
// -----------------------------------------------------------------------------

const axios = require('axios');

/**
 * Menghasilkan respons dari Gemini API.
 * @param {string} systemInstruction - Peran atau persona yang harus diambil oleh model.
 * @param {string} userQuery - Pertanyaan atau prompt utama dari pengguna.
 * @param {Array} history - (Opsional) Riwayat percakapan sebelumnya untuk konteks.
 * @returns {Promise<string>} - Teks balasan dari model.
 * @throws {Error} - Melempar error jika API call gagal.
 */
async function generateGeminiResponse(systemInstruction, userQuery, history = []) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API key is not configured on the server.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const contents = [...history, { role: "user", parts: [{ text: userQuery }] }];
    
    try {
        const response = await axios.post(apiUrl, {
            contents,
            systemInstruction: { parts: [{ text: systemInstruction }] }
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            return response.data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid response structure from Gemini API.");
        }
    } catch (error) {
        console.error("Gemini API Service Error:", error.response ? error.response.data : error.message);
        throw new Error("Failed to get response from AI assistant.");
    }
}

module.exports = { generateGeminiResponse };

// -----------------------------------------------------------------------------
// Controller untuk Logika Chatbot (Refactored)
// -----------------------------------------------------------------------------

const { generateGeminiResponse } = require('../services/geminiService');

// @desc    Handle chatbot conversation
// @route   POST /api/chatbot
// @access  Private
const handleChat = async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ message: "Message is required." });
    }

    const systemInstruction = "Anda adalah EnergyMate, asisten AI yang ramah, membantu, dan ahli dalam efisiensi energi untuk rumah tangga di Indonesia. Jawab pertanyaan pengguna dengan singkat, jelas, dan dalam Bahasa Indonesia. Fokus pada tips hemat listrik, penjelasan tentang peralatan rumah tangga, dan cara membaca tagihan listrik.";

    try {
        // Menggunakan service terpusat untuk memanggil Gemini API
        const botResponse = await generateGeminiResponse(systemInstruction, message, history);
        res.json({ reply: botResponse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { handleChat };

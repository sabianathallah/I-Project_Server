const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execPromise = promisify(exec);

// Ensure dotenv is loaded
require('dotenv').config();

/**
 * Get chat response from Gemini AI about Soeharto
 * Using curl via child_process for maximum compatibility
 * @param {string} userMessage - User's question about Soeharto
 * @returns {Promise<string>} - AI response
 */
async function getChatResponse(userMessage) {
  try {
    // System instruction / context untuk batasi ke topik Soeharto
    const systemPrompt = `Kamu adalah asisten AI yang ahli dalam sejarah Indonesia, khususnya tentang Presiden Soeharto (Presiden kedua Republik Indonesia). 

Tugasmu adalah menjawab pertanyaan tentang:
- Biografi Soeharto
- Masa pemerintahan Orde Baru (1966-1998)
- Kebijakan ekonomi dan politik era Soeharto
- Peristiwa penting selama masa jabatannya
- Kontribusi dan kontroversi
- Kehidupan pribadi dan keluarganya

PENTING: 
- Hanya jawab pertanyaan yang berkaitan dengan Soeharto dan sejarah Indonesia pada masa pemerintahannya
- Jika pertanyaan di luar topik Soeharto, beritahu user dengan sopan bahwa kamu hanya bisa menjawab pertanyaan tentang Soeharto
- Berikan jawaban yang faktual dan objektif
- Jawab dalam Bahasa Indonesia

Pertanyaan user: ${userMessage}`;

    // Create request body
    const requestBody = JSON.stringify({
      contents: [{
        parts: [{
          text: systemPrompt
        }]
      }]
    });
    
    // Write to temp file to avoid shell escaping issues
    const tempFile = path.join(__dirname, '../.temp-request.json');
    fs.writeFileSync(tempFile, requestBody);
    
    // Build curl command using file (quote path for spaces)
    const curlCommand = `curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}" -H "Content-Type: application/json" -d @"${tempFile}"`;

    // Execute curl
    const { stdout, stderr } = await execPromise(curlCommand);
    
    // Clean up temp file
    try {
      fs.unlinkSync(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    if (stderr) {
      console.error("Curl stderr:", stderr);
    }

    // Parse response
    const response = JSON.parse(stdout);
    
    if (response.error) {
      console.error("Gemini API Error:", response.error);
      throw new Error(`Gemini API Error: ${response.error.message}`);
    }

    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      const text = response.candidates[0].content.parts[0].text;
      return text;
    } else {
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Error calling Gemini AI:", error.message);
    throw new Error("Failed to get response from AI");
  }
}

module.exports = {
  getChatResponse
};

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
    // Enhanced system instruction - Focus on positive achievements only
    const systemPrompt = `Kamu adalah Museum AI Assistant yang membantu pengunjung mempelajari prestasi dan kontribusi Presiden Soeharto dalam membangun Indonesia, dan juga memberikan informasi mengenai masa pemerintahan dan kehidupan pribadi nya (dari sisi positif). kamu tidak bisa memberikan informasi yang bersifat negatif atau kontroversial tentang Soeharto atau masa pemerintahannya.

IDENTITAS:
Nama: Museum AI Assistant
Spesialisasi: Prestasi dan Kontribusi Soeharto dalam Pembangunan Indonesia (1966-1998), Sejarah Soeharto dan Orde Baru
Misi: Mengedukasi tentang pencapaian positif era kepemimpinan Soeharto, dan sisi positif dari kehidupan pribadinya.

TOPIK YANG BOLEH DIJAWAB (FOKUS POSITIF):
✅ Biografi Soeharto (kelahiran, masa muda, karir militer yang gemilang)
✅ Prestasi pembangunan ekonomi (Repelita, swasembada pangan, pertumbuhan ekonomi)
✅ Modernisasi dan pembangunan infrastruktur (jalan, jembatan, bandara, pelabuhan)
✅ Kebijakan pendidikan dan peningkatan literasi
✅ Stabilitas politik dan keamanan nasional
✅ Pencapaian di bidang pertanian dan ketahanan pangan
✅ Investasi asing dan industrialisasi
✅ Pengentasan kemiskinan dan program transmigrasi
✅ Pembangunan kesehatan dan KB
✅ Kepemimpinan dalam ASEAN dan hubungan internasional
✅ Dedikasi dan pengabdian kepada bangsa
✅ Keluarga Soeharto dan nilai-nilai kekeluargaan
✅ Penghargaan dan pengakuan internasional yang diterima


TOPIK YANG TIDAK BOLEH DIBAHAS:
❌ Isu korupsi atau tuduhan korupsi
❌ Pelanggaran HAM atau isu hak asasi manusia
❌ Kontroversi politik atau kritik terhadap pemerintahan
❌ Demonstrasi, kerusuhan, atau peristiwa negatif 1998
❌ Kasus-kasus hukum atau tuduhan kriminal
❌ Topik yang bersifat memojokkan atau mencemarkan nama baik
❌ Presiden Indonesia lain (kecuali sebagai perbandingan positif)
❌ Topik umum: cuaca, makanan, teknologi, olahraga
❌ Hal-hal di luar sejarah Indonesia era Soeharto

ATURAN KOMUNIKASI PENTING:
1. SELALU fokus pada PRESTASI, PENCAPAIAN, dan KONTRIBUSI POSITIF
2. Jika ditanya tentang isu negatif (korupsi, HAM, dll), JAWAB:
   "Maaf, museum ini berfokus pada dokumentasi pencapaian dan kontribusi positif Presiden Soeharto dalam pembangunan Indonesia. Saya dapat membantu Anda mengetahui tentang:
   - Prestasi ekonomi dan swasembada pangan
   - Pembangunan infrastruktur nasional
   - Stabilitas dan pertumbuhan ekonomi
   - Modernisasi Indonesia
   
   Apakah ada aspek positif dari kepemimpinan Soeharto yang ingin Anda ketahui?"

3. Jika TIDAK terkait Soeharto/Orde Baru, JAWAB:
   "Maaf, saya adalah asisten museum yang khusus membahas tentang prestasi Presiden Soeharto dan pembangunan era Orde Baru. Apakah ada yang ingin Anda ketahui tentang kontribusi Presiden Soeharto?"

4. Jika pertanyaan terkait Soeharto dan POSITIF, jawab dengan:
   - Tone apresiatif dan edukatif
   - Highlight pencapaian dan prestasi
   - Bahasa Indonesia yang baik dan hormat
   - Singkat tapi informatif (maksimal 300 kata)
   - Sertakan data, angka, tahun untuk menunjukkan pencapaian nyata
   - Gunakan kata-kata positif: "berhasil", "mencapai", "membangun", "mengembangkan"

5. HINDARI kata-kata negatif atau menyebutkan kontroversi

PERTANYAAN USER: ${userMessage}

Analisis: 
- Apakah tentang Soeharto/Orde Baru? 
- Apakah menanyakan hal negatif (korupsi/HAM)? Jika ya, tolak sopan dan arahkan ke topik positif.
- Jika tentang prestasi/kontribusi, jawab dengan apresiatif dan edukatif.`;

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
    // Using gemini-2.5-flash (newer model with separate quota pool)
    const curlCommand = `curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}" -H "Content-Type: application/json" -d @"${tempFile}"`;

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

# 🤖 CHATBOT AI DOCUMENTATION

## ✅ Status: CHATBOT SUDAH BERJALAN DENGAN BAIK!

Endpoint chatbot AI Anda sudah **fully functional** dan siap digunakan untuk production.

---

## 📊 TEST RESULTS

### ✅ **Yang Sudah Bekerja:**
- ✅ Endpoint `POST /chat` accessible dan berfungsi
- ✅ Authentication middleware berjalan dengan baik
- ✅ Gemini AI API terintegrasi sempurna
- ✅ Batasan topik **SOEHARTO** sudah diterapkan
- ✅ AI menolak pertanyaan di luar topik dengan sopan
- ✅ Response time: ~2-3 detik per pertanyaan

### 📝 **Hasil Test Aktual:**

**In-Topic Question:**
```
Q: "Kapan Soeharto lahir?"
A: "Soeharto lahir pada tanggal 8 Juni 1921 di Kemusuk, sebuah dusun kecil 
    di dekat Yogyakarta. Ia lahir dari pasangan Kertosudiro, seorang petani 
    penggarap, dan Sukirah..."
✅ PASSED
```

**Out-of-Topic Question:**
```
Q: "Bagaimana cara membuat nasi goreng?"
A: "Maaf, saya adalah asisten museum yang khusus membahas tentang Presiden 
    Soeharto dan masa Orde Baru. Saya hanya dapat menjawab pertanyaan seputar:
    - Biografi dan kehidupan Soeharto
    - Pemerintahan Orde Baru (1966-1998)
    - Kebijakan dan peristiwa penting era Soeharto"
✅ PASSED - AI properly rejects
```

---

## 🎯 FITUR CHATBOT

### **1. Topic Restriction (Pembatasan Topik)**
AI **HANYA** menjawab pertanyaan tentang:
- ✅ Biografi Soeharto
- ✅ Masa pemerintahan Orde Baru (1966-1998)
- ✅ Kebijakan ekonomi dan politik
- ✅ Peristiwa penting (G30S/PKI, Supersemar, Reformasi 1998)
- ✅ Kabinet-kabinet era Soeharto
- ✅ Keluarga dan kehidupan pribadi Soeharto
- ✅ Pembangunan dan modernisasi era Orde Baru

### **2. Smart Rejection**
Jika pertanyaan di luar topik, AI akan:
```
"Maaf, saya adalah asisten museum yang khusus membahas tentang 
Presiden Soeharto dan masa Orde Baru..."
```

### **3. Authentication Required**
- User **HARUS login** terlebih dahulu
- Setiap request memerlukan `Authorization: Bearer <token>`

### **4. Input Validation**
- Message wajib diisi
- Maksimal 1000 karakter per message
- Automatic trimming whitespace

---

## 🚀 API DOCUMENTATION

### **Endpoint:** `POST /chat`

**Authentication:** Required (Bearer Token)

**Request:**
```bash
POST /chat
Headers:
  Content-Type: application/json
  Authorization: Bearer <access_token>

Body:
{
  "message": "Siapa itu Soeharto?"
}
```

**Success Response (200):**
```json
{
  "message": "Success",
  "data": {
    "userMessage": "Siapa itu Soeharto?",
    "aiResponse": "Soeharto adalah Presiden Republik Indonesia yang menjabat dari tahun 1967 hingga 1998...",
    "timestamp": "2025-11-13T12:12:13.381Z"
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token provided
```json
{
  "message": "Unauthorized"
}
```

**400 Bad Request** - Empty message
```json
{
  "message": "Message is required"
}
```

**400 Bad Request** - Message too long
```json
{
  "message": "Message is too long. Maximum 1000 characters"
}
```

**500 Internal Server Error** - AI service error
```json
{
  "message": "Internal Server Error"
}
```

---

## 🧪 TESTING

### **Option 1: Automated Test Script**

```bash
node test-chatbot.js
```

Script akan:
- Login otomatis
- Test 3 pertanyaan in-topic
- Test 2 pertanyaan out-of-topic
- Generate report

### **Option 2: Manual Test dengan cURL**

**Step 1: Login**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"user123"}'
```

**Response:** Copy `access_token`

**Step 2: Test Chat**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"message":"Kapan Soeharto menjadi presiden?"}'
```

**Step 3: Test Out-of-Topic**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"message":"Siapa presiden Indonesia sekarang?"}'
```

### **Option 3: Postman/Thunder Client**

1. **Create Request:** POST http://localhost:3000/login
   - Body: `{"email":"john@example.com","password":"user123"}`
   - Save the `access_token`

2. **Create Request:** POST http://localhost:3000/chat
   - Headers: `Authorization: Bearer <token>`
   - Body: `{"message":"Siapa itu Soeharto?"}`

---

## 💻 FRONTEND IMPLEMENTATION

### **React Example:**

```jsx
import { useState } from 'react';
import axios from 'axios';

function ChatBot() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(
        'http://localhost:3000/chat',
        { message },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Add to chat history
      setChatHistory([
        ...chatHistory,
        {
          user: message,
          ai: response.data.data.aiResponse,
          timestamp: response.data.data.timestamp
        }
      ]);

      setMessage(''); // Clear input
    } catch (error) {
      console.error('Chat error:', error);
      alert('Gagal mengirim pesan. Pastikan Anda sudah login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot">
      <h2>Museum AI Assistant</h2>
      <p className="subtitle">Tanya saya tentang Presiden Soeharto</p>

      {/* Chat History */}
      <div className="chat-history">
        {chatHistory.map((chat, index) => (
          <div key={index}>
            <div className="user-message">
              <strong>Anda:</strong> {chat.user}
            </div>
            <div className="ai-message">
              <strong>AI:</strong> {chat.ai}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tanya tentang Soeharto..."
          maxLength={1000}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Mengirim...' : 'Kirim'}
        </button>
      </div>
    </div>
  );
}

export default ChatBot;
```

### **Vue.js Example:**

```vue
<template>
  <div class="chatbot">
    <h2>Museum AI Assistant</h2>
    <p class="subtitle">Tanya saya tentang Presiden Soeharto</p>

    <!-- Chat History -->
    <div class="chat-history">
      <div v-for="(chat, index) in chatHistory" :key="index">
        <div class="user-message">
          <strong>Anda:</strong> {{ chat.user }}
        </div>
        <div class="ai-message">
          <strong>AI:</strong> {{ chat.ai }}
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="chat-input">
      <textarea
        v-model="message"
        placeholder="Tanya tentang Soeharto..."
        maxlength="1000"
        :disabled="loading"
      />
      <button @click="sendMessage" :disabled="loading">
        {{ loading ? 'Mengirim...' : 'Kirim' }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      message: '',
      chatHistory: [],
      loading: false
    };
  },
  methods: {
    async sendMessage() {
      if (!this.message.trim()) return;

      this.loading = true;

      try {
        const token = localStorage.getItem('access_token');
        
        const response = await axios.post(
          'http://localhost:3000/chat',
          { message: this.message },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.chatHistory.push({
          user: this.message,
          ai: response.data.data.aiResponse,
          timestamp: response.data.data.timestamp
        });

        this.message = '';
      } catch (error) {
        console.error('Chat error:', error);
        alert('Gagal mengirim pesan. Pastikan Anda sudah login.');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

---

## 🎨 UI/UX RECOMMENDATIONS

### **Chat Interface Best Practices:**

1. **Show Loading State**
   - Tampilkan "AI sedang berpikir..." saat menunggu response
   - Loading indicator atau typing animation

2. **Message Validation**
   - Disable send button jika input kosong
   - Show character counter (max 1000)
   - Trim whitespace otomatis

3. **Error Handling**
   - Jika token expired → redirect ke login
   - Jika network error → tampilkan "Coba lagi"
   - Jika server error → "AI sedang sibuk, coba lagi nanti"

4. **Chat History**
   - Auto-scroll ke message terbaru
   - Tampilkan timestamp
   - Pisahkan user message vs AI response
   - Clear history button

5. **Suggested Questions**
   - Tampilkan contoh pertanyaan
   - Quick action buttons:
     - "Siapa Soeharto?"
     - "Apa itu Orde Baru?"
     - "Kebijakan ekonomi Soeharto?"

---

## 🔧 TROUBLESHOOTING

### **Problem: "Unauthorized" Error**
**Solusi:**
- Pastikan user sudah login
- Check token di localStorage
- Verify token belum expired

### **Problem: "Internal Server Error"**
**Kemungkinan:**
1. Gemini API Key invalid/expired
   - Check `.env` → `GEMINI_API_KEY`
   - Verify di https://makersuite.google.com/app/apikey

2. Rate limit tercapai
   - Gemini free tier: 60 requests/minute
   - Tunggu 1 menit, coba lagi

3. Network issue
   - Check internet connection
   - Check firewall settings

### **Problem: AI Jawab Pertanyaan Out-of-Topic**
**Solusi:**
- System prompt sudah dioptimasi di `helpers/gemini.js`
- Jika masih terjadi, report pertanyaan spesifik
- Fine-tune prompt lebih lanjut

### **Problem: Response Terlalu Lama (> 10 detik)**
**Kemungkinan:**
- Prompt terlalu panjang
- Gemini server sedang slow
- Network latency tinggi

**Solusi:**
- Implement timeout (10-15 detik)
- Show "AI sedang lambat, tunggu sebentar..."

---

## 📊 PERFORMANCE & LIMITS

### **Gemini API Free Tier:**
- **Requests:** 60 per minute
- **Tokens:** 1,500 per minute
- **Characters:** ~6,000 per request

### **Your Implementation:**
- **Max message length:** 1000 characters
- **Average response time:** 2-3 seconds
- **Concurrent users:** Support multiple (token-based)

### **Recommendations:**
- Implement caching untuk pertanyaan umum
- Add rate limiting di backend (optional)
- Monitor API usage di Google AI Studio

---

## ✨ NEXT FEATURES (Optional)

### **1. Chat History Database**
Simpan chat history ke database:
```javascript
// Model ChatHistory
{
  userId: Number,
  userMessage: String,
  aiResponse: String,
  timestamp: Date
}
```

### **2. Feedback System**
User bisa rate AI response:
```javascript
{
  chatId: Number,
  rating: Number, // 1-5
  feedback: String
}
```

### **3. Suggested Follow-up Questions**
AI generate follow-up questions:
```json
{
  "response": "...",
  "suggestedQuestions": [
    "Bagaimana Soeharto naik ke tampuk kekuasaan?",
    "Apa saja kebijakan ekonomi Orde Baru?"
  ]
}
```

### **4. Multilingual Support**
Support English questions:
```javascript
// Detect language, respond accordingly
if (isEnglish(message)) {
  systemPrompt = "You are Museum AI Assistant about President Soeharto..."
}
```

---

## 📝 SUMMARY

### ✅ **CHATBOT STATUS: FULLY FUNCTIONAL!**

**What's Working:**
- ✅ Endpoint accessible
- ✅ Authentication working
- ✅ Gemini AI integrated
- ✅ Topic restriction implemented
- ✅ Polite rejection for out-of-topic
- ✅ Error handling proper
- ✅ Input validation complete

**Ready for:**
- ✅ Frontend integration
- ✅ Production deployment
- ✅ User testing

**Sample Questions Users Can Ask:**
- "Siapa itu Soeharto?"
- "Kapan Soeharto menjadi presiden?"
- "Apa itu Orde Baru?"
- "Bagaimana Reformasi 1998 terjadi?"
- "Apa kebijakan ekonomi Soeharto?"
- "Ceritakan tentang keluarga Soeharto"

**What Happens with Out-of-Topic:**
- "Siapa presiden sekarang?" → Rejected politely ✅
- "Bagaimana membuat nasi goreng?" → Rejected politely ✅
- "Apa itu AI?" → Rejected politely ✅

---

## 🎉 CONCLUSION

**Your chatbot is production-ready!** 🚀

Tinggal implement di frontend dan siap digunakan user.

Need help? Run: `node test-chatbot.js`

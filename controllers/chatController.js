const { getChatResponse } = require("../helpers/gemini");

class ChatController {
  /**
   * Handle chat request from user
   * POST /chat
   * Body: { message: "pertanyaan user" }
   */
  static async chat(req, res, next) {
    try {
      const { message } = req.body;
      const userId = req.user.id; // From authentication middleware
      const userEmail = req.user.email;

      // Validasi input
      if (!message || message.trim() === "") {
        return res.status(400).json({
          message: "Message is required"
        });
      }

      // Validasi panjang message
      if (message.length > 1000) {
        return res.status(400).json({
          message: "Message is too long. Maximum 1000 characters"
        });
      }

      // Log request untuk monitoring
      console.log(`[CHAT] User ${userEmail} (ID: ${userId}): "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

      // Get response from Gemini AI
      const aiResponse = await getChatResponse(message);

      // Log success
      console.log(`[CHAT] Response sent to user ${userEmail}`);

      res.status(200).json({
        message: "Success",
        data: {
          userMessage: message,
          aiResponse: aiResponse,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error(`[CHAT ERROR] ${error.message}`);
      next(error);
    }
  }
}

module.exports = ChatController;

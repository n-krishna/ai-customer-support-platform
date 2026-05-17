const express = require("express");
const jwt = require("jsonwebtoken");
const OpenAI = require("openai");

const pool = require("../db");

const router = express.Router();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
    "X-Title": "SupportAI",
  },
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

router.post("/message", verifyToken, async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const userMessage = message?.trim();

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "OpenRouter API key is missing in .env file",
      });
    }

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    let activeChatId = chatId;

    if (!activeChatId) {
      const title =
        userMessage.length > 45
          ? `${userMessage.substring(0, 45)}...`
          : userMessage;

      const chatResult = await pool.query(
        `
        INSERT INTO chats (user_id, title)
        VALUES ($1, $2)
        RETURNING id
        `,
        [req.user.id, title]
      );

      activeChatId = chatResult.rows[0].id;
    }

    await pool.query(
      `
      INSERT INTO messages (chat_id, sender, message)
      VALUES ($1, $2, $3)
      `,
      [activeChatId, "user", userMessage]
    );

    const previousMessages = await pool.query(
      `
      SELECT sender, message
      FROM messages
      WHERE chat_id = $1
      ORDER BY created_at ASC
      LIMIT 20
      `,
      [activeChatId]
    );

    const conversationMessages = previousMessages.rows.map((item) => ({
      role: item.sender === "user" ? "user" : "assistant",
      content: item.message,
    }));

    const completion = await openai.chat.completions.create({
      model: "openrouter/free",
      messages: [
        {
          role: "system",
          content:
            "You are SupportAI, a professional AI customer support assistant. Reply naturally like ChatGPT based on the user's prompt. Be clear, friendly, and concise.",
        },
        ...conversationMessages,
      ],
    });

    const botReply =
      completion.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    await pool.query(
      `
      INSERT INTO messages (chat_id, sender, message)
      VALUES ($1, $2, $3)
      `,
      [activeChatId, "bot", botReply]
    );

    return res.json({
      success: true,
      chatId: activeChatId,
      reply: botReply,
    });
  } catch (error) {
    console.error("AI chatbot error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "AI response failed. Check OpenRouter API key or backend logs.",
    });
  }
});

router.get("/chats", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, title, created_at
      FROM chats
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    return res.json({
      success: true,
      chats: result.rows,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
    });
  }
});

router.get("/messages/:chatId", verifyToken, async (req, res) => {
  try {
    const { chatId } = req.params;

    const chatResult = await pool.query(
      `
      SELECT id
      FROM chats
      WHERE id = $1 AND user_id = $2
      `,
      [chatId, req.user.id]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const result = await pool.query(
      `
      SELECT id, sender, message, created_at
      FROM messages
      WHERE chat_id = $1
      ORDER BY created_at ASC
      `,
      [chatId]
    );

    return res.json({
      success: true,
      messages: result.rows,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
});

router.post("/ticket", verifyToken, async (req, res) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO tickets (user_id, subject, description)
      VALUES ($1, $2, $3)
      RETURNING id, subject, description, status, created_at
      `,
      [req.user.id, subject, description]
    );

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      ticket: result.rows[0],
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to create support ticket",
    });
  }
});

module.exports = router;
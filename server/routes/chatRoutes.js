const axios = require("axios");
const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const pool = require("../db");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Multer Upload Config
|--------------------------------------------------------------------------
*/

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

/*
|--------------------------------------------------------------------------
| Ollama Config
|--------------------------------------------------------------------------
*/

const OLLAMA_CHAT_URL =
  process.env.OLLAMA_CHAT_URL ||
  "http://127.0.0.1:11434/api/chat";

const OLLAMA_GENERATE_URL =
  process.env.OLLAMA_GENERATE_URL ||
  "http://127.0.0.1:11434/api/generate";

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "llama3.2";

const OLLAMA_IMAGE_MODEL =
  process.env.OLLAMA_IMAGE_MODEL || "llava";

/*
|--------------------------------------------------------------------------
| Auth Middleware
|--------------------------------------------------------------------------
*/

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    req.user = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET
    );

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const deleteUploadedFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/*
|--------------------------------------------------------------------------
| AI Chat Message
|--------------------------------------------------------------------------
*/

router.post(
  "/message",
  verifyToken,
  async (req, res) => {
    try {
      const { message, chatId } = req.body;

      const userMessage = message?.trim();

      if (!userMessage) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      let activeChatId = chatId;

      /*
      |--------------------------------------------------------------------------
      | Create Chat
      |--------------------------------------------------------------------------
      */

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

      /*
      |--------------------------------------------------------------------------
      | Save User Message
      |--------------------------------------------------------------------------
      */

      await pool.query(
        `
        INSERT INTO messages (chat_id, sender, message)
        VALUES ($1, $2, $3)
        `,
        [activeChatId, "user", userMessage]
      );

      /*
      |--------------------------------------------------------------------------
      | Fetch Previous Messages
      |--------------------------------------------------------------------------
      */

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

      const conversationMessages =
        previousMessages.rows.map((item) => ({
          role:
            item.sender === "user"
              ? "user"
              : "assistant",
          content: item.message,
        }));

      /*
      |--------------------------------------------------------------------------
      | Ollama AI Response
      |--------------------------------------------------------------------------
      */

      const ollamaResponse = await axios.post(
        OLLAMA_CHAT_URL,
        {
          model: OLLAMA_MODEL,

          messages: [
            {
              role: "system",
              content:
                "You are SupportAI, a professional AI customer support assistant. Reply naturally like ChatGPT based on the user's prompt. Help with account issues, troubleshooting, billing, profile updates, technical support, and general questions. If the issue requires human assistance, suggest creating a support ticket.",
            },

            ...conversationMessages,
          ],

          stream: false,
        },
        {
          timeout: 120000,
        }
      );

      const botReply =
        ollamaResponse.data?.message?.content ||
        "Sorry, I could not generate a response.";

      /*
      |--------------------------------------------------------------------------
      | Save AI Reply
      |--------------------------------------------------------------------------
      */

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
      console.error(
        "Ollama chatbot error:",
        error.response?.data || error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "AI response failed. Make sure Ollama is running.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Image Analysis
|--------------------------------------------------------------------------
*/

router.post(
  "/image",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const userMessage =
        req.body.message?.trim() ||
        "Analyze this image and explain what you see.";

      let activeChatId =
        req.body.chatId || null;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Create Chat
      |--------------------------------------------------------------------------
      */

      if (!activeChatId) {
        const chatResult = await pool.query(
          `
          INSERT INTO chats (user_id, title)
          VALUES ($1, $2)
          RETURNING id
          `,
          [req.user.id, "Image Analysis"]
        );

        activeChatId = chatResult.rows[0].id;
      }

      /*
      |--------------------------------------------------------------------------
      | Convert Image
      |--------------------------------------------------------------------------
      */

      const imageBuffer = fs.readFileSync(
        req.file.path
      );

      const base64Image =
        imageBuffer.toString("base64");

      /*
      |--------------------------------------------------------------------------
      | Save User Message
      |--------------------------------------------------------------------------
      */

      await pool.query(
        `
        INSERT INTO messages (chat_id, sender, message)
        VALUES ($1, $2, $3)
        `,
        [activeChatId, "user", userMessage]
      );

      /*
      |--------------------------------------------------------------------------
      | Ollama Vision
      |--------------------------------------------------------------------------
      */

      const ollamaResponse = await axios.post(
        OLLAMA_GENERATE_URL,
        {
          model: OLLAMA_IMAGE_MODEL,
          prompt: userMessage,
          images: [base64Image],
          stream: false,
        },
        {
          timeout: 180000,
        }
      );

      const botReply =
        ollamaResponse.data?.response ||
        "Sorry, I could not analyze this image.";

      /*
      |--------------------------------------------------------------------------
      | Save AI Reply
      |--------------------------------------------------------------------------
      */

      await pool.query(
        `
        INSERT INTO messages (chat_id, sender, message)
        VALUES ($1, $2, $3)
        `,
        [activeChatId, "bot", botReply]
      );

      deleteUploadedFile(req.file.path);

      return res.json({
        success: true,
        chatId: activeChatId,
        reply: botReply,
      });
    } catch (error) {
      console.error(
        "Image analysis error:",
        error.response?.data || error.message
      );

      deleteUploadedFile(req.file?.path);

      return res.status(500).json({
        success: false,
        message:
          "Image analysis failed. Make sure Ollama and llava are running.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Fetch Chats
|--------------------------------------------------------------------------
*/

router.get(
  "/chats",
  verifyToken,
  async (req, res) => {
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
    } catch (error) {
      console.error(
        "Fetch chats error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch chats",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Fetch Chat Messages
|--------------------------------------------------------------------------
*/

router.get(
  "/messages/:chatId",
  verifyToken,
  async (req, res) => {
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
    } catch (error) {
      console.error(
        "Fetch messages error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch messages",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Create Ticket
|--------------------------------------------------------------------------
*/

router.post("/ticket", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const subject = req.body.subject?.trim();
    const description = req.body.description?.trim();

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required",
      });
    }

    const imagePath = req.file ? req.file.path : null;

    const result = await pool.query(
      `
      INSERT INTO tickets (user_id, subject, description, image_path)
      VALUES ($1, $2, $3, $4)
      RETURNING id, subject, description, status, image_path, created_at
      `,
      [req.user.id, subject, description, imagePath]
    );

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      ticket: result.rows[0],
    });
  } catch (error) {
    console.error("Create ticket error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create ticket",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Fetch Tickets
|--------------------------------------------------------------------------
*/

router.get(
  "/tickets",
  verifyToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          subject,
          description,
          status,
          created_at
        FROM tickets
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [req.user.id]
      );

      return res.json({
        success: true,
        tickets: result.rows,
      });
    } catch (error) {
      console.error(
        "Fetch tickets error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch tickets",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Delete Chat
|--------------------------------------------------------------------------
*/

router.delete(
  "/delete/:chatId",
  verifyToken,
  async (req, res) => {
    try {
      const { chatId } = req.params;

      const result = await pool.query(
        `
        DELETE FROM chats
        WHERE id = $1 AND user_id = $2
        RETURNING id
        `,
        [chatId, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }

      return res.json({
        success: true,
        message: "Chat deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete chat error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete chat",
      });
    }
  }
);

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  next();
};

router.get("/admin/dashboard", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const usersResult = await pool.query(
      `
      SELECT id, full_name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
      `
    );

    const ticketsResult = await pool.query(
      `
      SELECT 
        tickets.id,
        tickets.subject,
        tickets.description,
        tickets.status,
        tickets.created_at,
        users.full_name,
        users.email
      FROM tickets
      JOIN users ON tickets.user_id = users.id
      ORDER BY tickets.created_at DESC
      `
    );

    const chatsResult = await pool.query(
      `
      SELECT 
        chats.id,
        chats.title,
        chats.created_at,
        users.full_name,
        users.email
      FROM chats
      JOIN users ON chats.user_id = users.id
      ORDER BY chats.created_at DESC
      LIMIT 10
      `
    );

    return res.json({
      success: true,
      users: usersResult.rows,
      tickets: ticketsResult.rows,
      chats: chatsResult.rows,
      stats: {
        totalUsers: usersResult.rows.length,
        totalTickets: ticketsResult.rows.length,
        openTickets: ticketsResult.rows.filter(
          (ticket) => ticket.status === "Open"
        ).length,
        resolvedTickets: ticketsResult.rows.filter(
          (ticket) => ticket.status === "Resolved"
        ).length,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
    });
  }
});

router.get("/admin/tickets/:ticketId", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticketResult = await pool.query(
      `
      SELECT
        tickets.id,
        tickets.subject,
        tickets.description,
        tickets.status,
        tickets.created_at,
        users.full_name,
        users.email
      FROM tickets
      JOIN users ON tickets.user_id = users.id
      WHERE tickets.id = $1
      `,
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const commentsResult = await pool.query(
      `
      SELECT
        ticket_comments.id,
        ticket_comments.comment,
        ticket_comments.created_at,
        users.full_name AS admin_name
      FROM ticket_comments
      LEFT JOIN users ON ticket_comments.admin_id = users.id
      WHERE ticket_comments.ticket_id = $1
      ORDER BY ticket_comments.created_at ASC
      `,
      [ticketId]
    );

    return res.json({
      success: true,
      ticket: ticketResult.rows[0],
      comments: commentsResult.rows,
    });
  } catch (error) {
    console.error("Fetch ticket details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load ticket details",
    });
  }
});

router.post("/admin/tickets/:ticketId/comment", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const comment = req.body.comment?.trim();

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO ticket_comments (ticket_id, admin_id, comment)
      VALUES ($1, $2, $3)
      RETURNING id, comment, created_at
      `,
      [ticketId, req.user.id, comment]
    );

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: result.rows[0],
    });
  } catch (error) {
    console.error("Add ticket comment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
});

router.patch("/admin/tickets/:ticketId/status", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Open", "Pending", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket status",
      });
    }

    const result = await pool.query(
      `
      UPDATE tickets
      SET status = $1
      WHERE id = $2
      RETURNING id, subject, status
      `,
      [status, ticketId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    return res.json({
      success: true,
      message: "Ticket status updated successfully",
      ticket: result.rows[0],
    });
  } catch (error) {
    console.error("Update ticket status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update ticket status",
    });
  }
});

module.exports = router;
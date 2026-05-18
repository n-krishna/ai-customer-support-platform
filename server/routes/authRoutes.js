const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const pool = require("../db");

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, dob, password } = req.body;

    if (!fullName || !email || !dob || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, DOB, and password are required",
      });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Account already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query("DELETE FROM pending_users WHERE email = $1", [email]);

    await pool.query(
      `
      INSERT INTO pending_users
      (
        full_name,
        email,
        dob,
        password,
        otp,
        otp_expires,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [fullName, email, dob, hashedPassword, otp, otpExpires, "customer"]
    );

    await transporter.sendMail({
      from: `"SupportAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SupportAI Email Verification OTP",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Register error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

router.post("/admin-register", async (req, res) => {
  try {
    const { fullName, email, password, adminSecret } = req.body;

    if (!fullName || !email || !password || !adminSecret) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin registration code",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Account already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query("DELETE FROM pending_users WHERE email = $1", [email]);

    await pool.query(
      `
      INSERT INTO pending_users
      (
        full_name,
        email,
        dob,
        password,
        otp,
        otp_expires,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [fullName, email, null, hashedPassword, otp, otpExpires, "admin"]
    );

    await transporter.sendMail({
      from: `"SupportAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SupportAI Admin Verification OTP",
      html: `
        <h2>Admin Email Verification</h2>
        <p>Your admin verification OTP code is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Admin OTP sent to your email",
    });
  } catch (error) {
    console.error("Admin register error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Admin registration failed",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const pendingUser = await pool.query(
      "SELECT * FROM pending_users WHERE email = $1",
      [email]
    );

    if (pendingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending registration found",
      });
    }

    const user = pendingUser.rows[0];

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please register again.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO users
      (
        full_name,
        email,
        dob,
        password,
        role
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, full_name, email, dob, role, created_at
      `,
      [
        user.full_name,
        user.email,
        user.dob,
        user.password,
        user.role || "customer",
      ]
    );

    await pool.query("DELETE FROM pending_users WHERE email = $1", [email]);

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: "Account verified successfully",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("OTP verification error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error verifying OTP",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        dob: user.dob,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        dob,
        role,
        created_at
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
});

router.post("/update-profile", verifyToken, async (req, res) => {
  try {
    const { fullName } = req.body;

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET full_name = $1
      WHERE id = $2
      RETURNING id, full_name, email, dob, role, created_at
      `,
      [fullName, req.user.id]
    );

    const updatedUser = result.rows[0];

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
});

router.post("/send-email-change-otp", verifyToken, async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: "New email is required",
      });
    }

    const existingEmail = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      AND id != $2
      `,
      [newEmail, req.user.id]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This email is already used by another account",
      });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `
      UPDATE users
      SET
        pending_email = $1,
        email_change_otp = $2,
        email_change_otp_expires = $3
      WHERE id = $4
      `,
      [newEmail, otp, otpExpires, req.user.id]
    );

    await transporter.sendMail({
      from: `"SupportAI" <${process.env.EMAIL_USER}>`,
      to: newEmail,
      subject: "Verify your new SupportAI email",
      html: `
        <h2>Email Change Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    res.json({
      success: true,
      message: "OTP sent to your new email address",
    });
  } catch (error) {
    console.error("Send email change OTP error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to send email verification OTP",
    });
  }
});

router.post("/verify-email-change-otp", verifyToken, async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    if (!user.pending_email) {
      return res.status(400).json({
        success: false,
        message: "No email change request found",
      });
    }

    if (user.email_change_otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > new Date(user.email_change_otp_expires)) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    const updatedUserResult = await pool.query(
      `
      UPDATE users
      SET
        email = pending_email,
        pending_email = NULL,
        email_change_otp = NULL,
        email_change_otp_expires = NULL
      WHERE id = $1
      RETURNING id, full_name, email, dob, role, created_at
      `,
      [req.user.id]
    );

    const updatedUser = updatedUserResult.rows[0];
    const newToken = generateToken(updatedUser);

    res.json({
      success: true,
      message: "Email updated successfully",
      token: newToken,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Verify email change OTP error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to verify email change OTP",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email credentials are missing in .env file",
      });
    }

    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `
      UPDATE users
      SET
        reset_token = $1,
        reset_token_expires = $2
      WHERE email = $3
      `,
      [resetToken, resetTokenExpires, email]
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"SupportAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SupportAI Password Reset",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error sending reset email",
    });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const userResult = await pool.query(
      `
      SELECT *
      FROM users
      WHERE reset_token = $1
      AND reset_token_expires > NOW()
      `,
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `
      UPDATE users
      SET
        password = $1,
        reset_token = NULL,
        reset_token_expires = NULL
      WHERE reset_token = $2
      `,
      [hashedPassword, token]
    );

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error resetting password",
    });
  }
});

module.exports = router;
require("dotenv").config();
const Express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const path = require("path");
// const { fileURLToPath } = require("url")

const Admin = require("./models/admin");
const { sendVerificationEmail } = require("./services/emailService");

const PORT = process.env.PORT || 4000;
const URI = process.env.MONGO_URI;
const app = Express();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

app.use(cors());
app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());
app.use(Express.static(path.join(__dirname, '../public')));

mongoose
  .connect(URI)
  .then(() => console.log("✅ Connected to the DB"))
  .catch((err) => console.error(`❌ Mongoose error: ${err}`));

app.post("/admin-register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const isUserExist = await Admin.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPass = await bcrypt.hashSync(password, 10);

    // Generate verification token (valid for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPass,
      verificationToken,
      verificationTokenExpiry: tokenExpiry,
    });
    await newAdmin.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, name);
    } catch (emailError) {
      console.error("Email send failed, but user created:", emailError);
      // User created, but email not sent - proceed anyway
    }

    res.json({
      success: true,
      message: "Admin registered successfully! Please check your email to verify your account.",
      admin: {
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (err) {
    console.error(`Server Error: ${err}`);
    res.status(500).json({ message: "Server error during registration" });
  }
});

app.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const isUserExist = await Admin.findOne({ email });
    if (!isUserExist) {
      return res.status(400).json({ message: "User not exists" });
    }

    // Check if email is verified
    if (!isUserExist.isEmailVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in. Check your email for the verification link.",
        emailVerified: false,
      });
    }

    const isPasswordCorrect = await bcrypt.compareSync(
      password,
      isUserExist.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: isUserExist._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      success: true,
      message: "Admin login successfully",
      token,
    });
  } catch (err) {
    console.error(`Server Error: ${err}`);
    res.status(500).json({ message: "Server error during login" });
  }
});

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      return res.status(400).json({ message: "No verification token provided" });
    }

    const admin = await Admin.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }, // Token must not be expired
    });

    if (!admin) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    // Update admin to mark email as verified
    admin.isEmailVerified = true;
    admin.verificationToken = null;
    admin.verificationTokenExpiry = null;
    await admin.save();

    res.json({
      success: true,
      message: "Email verified successfully! You can now login to your account.",
    });
  } catch (err) {
    console.error(`Server Error: ${err}`);
    res.status(500).json({ message: "Server error during email verification" });
  }
});

// Resend verification email endpoint
app.post("/resend-verification-email", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    if (admin.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new verification token
    const newVerificationToken = crypto.randomBytes(32).toString("hex");
    const newTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    admin.verificationToken = newVerificationToken;
    admin.verificationTokenExpiry = newTokenExpiry;
    await admin.save();

    // Send new verification email
    try {
      await sendVerificationEmail(email, newVerificationToken, admin.name);
    } catch (emailError) {
      console.error("Error resending email:", emailError);
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.json({
      success: true,
      message: "Verification email resent successfully. Check your inbox.",
    });
  } catch (err) {
    console.error(`Server Error: ${err}`);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/name", (req, res) => {
  res.json({ name: "Subham", role: "Admin" });
});

// Routes to serve admin pages
app.get("/admin-login", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-panel/login.html'));
});

app.get("/admin-register", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-panel/signup.html'));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-panel/admin.html'));
});

app.listen(PORT, () => console.log("Server is Started at PORT:", PORT));

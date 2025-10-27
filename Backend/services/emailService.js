const nodemailer = require("nodemailer");

// Create transporter using Gmail (you can replace with your email service)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send verification email to admin
 * @param {string} email - Admin email address
 * @param {string} verificationToken - Unique verification token
 * @param {string} adminName - Admin name for personalization
 */
const sendVerificationEmail = async (email, verificationToken, adminName) => {
  try {
    // Using localhost:3000 since frontend is served on port 3000
    const verificationLink = `http://localhost:4000/verify-email.html?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - Music Director Admin",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0;">Email Verification</h2>
          </div>

          <div style="color: #555; line-height: 1.6; margin-bottom: 30px;">
            <p>Hi <strong>${adminName}</strong>,</p>
            
            <p>Thank you for registering as an admin! To complete your registration and access your account, please verify your email address by clicking the button below:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email
              </a>
            </div>

            <p style="font-size: 12px; color: #999; margin: 20px 0;">
              Or copy and paste this link in your browser:<br>
              <code style="background-color: #f5f5f5; padding: 5px 10px; border-radius: 3px; word-break: break-all;">${verificationLink}</code>
            </p>

            <p style="color: #d9534f; font-size: 12px;">
              <strong>Note:</strong> This verification link will expire in 24 hours.
            </p>
          </div>

          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
            <p>If you didn't create this account, please ignore this email.</p>
            <p>&copy; 2025 Music Director Admin. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent:", info.response);
    return true;
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw error;
  }
};

module.exports = { sendVerificationEmail };

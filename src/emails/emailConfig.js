const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // Replace this with your email service (e.g., 'SMTP', 'SendGrid', etc.)
  auth: {
    user: "your_email@example.com", // Replace with your email address
    pass: "your_email_password", // Replace with your email password or an app-specific password
  },
});

module.exports = transporter;

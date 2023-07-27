const transporter = require("./emailConfig");

async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: "your_email@example.com", // Replace with your email address
      to: to,
      subject: subject,
      text: text,
    });

    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

module.exports = sendEmail;

const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // 👈 switch from 465 to 587
    secure: false, // 👈 must be false for 587
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"SkillSwap" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;

const nodemailer = require("nodemailer");
const config = require("../config/index");

async function sendEmailUser(to, html, subject) {
  const transporter = nodemailer.createTransport({
    host: config.smtp.smtp_host,
    port: parseInt(config.smtp.smtp_port),
    auth: {
      user: config.smtp.smtp_mail,
      pass: config.smtp.smtp_password,
    },
  });

  await transporter.sendMail({
    from: config.smtp.smtp_mail,
    to,
    subject: subject ? subject : "Admin email sending you.",
    html,
  });
}

module.exports = { sendEmailUser };
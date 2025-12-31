const nodemailer = require('nodemailer');

const createTransporter = (email, password) => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: email, pass: password }
  });
};

const transporters = {
  noreply: () => createTransporter(process.env.EMAIL_NOREPLY, process.env.EMAIL_NOREPLY_PASS),
  assessments: () => createTransporter(process.env.EMAIL_ASSESSMENTS, process.env.EMAIL_ASSESSMENTS_PASS),
  jobs: () => createTransporter(process.env.EMAIL_JOBS, process.env.EMAIL_JOBS_PASS),
  recruitment: () => createTransporter(process.env.EMAIL_RECRUITMENT, process.env.EMAIL_RECRUITMENT_PASS)
};

const sendEmail = async (type, { to, subject, html, text }) => {
  const transporter = transporters[type]();
  const from = transporter.options.auth.user;
  
  return await transporter.sendMail({ from, to, subject, html, text });
};

module.exports = { sendEmail };

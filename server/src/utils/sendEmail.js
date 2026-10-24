import nodemailer from 'nodemailer';

export default async function sendEmail({ to, subject, html }) {
  const { EMAIL_USER, EMAIL_PASS, NODE_ENV } = process.env;

  // Email set nahi hai aur development hai: link terminal me print kar do
  if (!EMAIL_USER || !EMAIL_PASS) {
    if (NODE_ENV !== 'production') {
      console.log(`\n[DEV EMAIL] To: ${to}\nSubject: ${subject}\n${html}\n`);
      return;
    }
    throw new Error('Email is not configured on the server.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });
  await transporter.sendMail({ from: `"ShramSetu" <${EMAIL_USER}>`, to, subject, html });
}
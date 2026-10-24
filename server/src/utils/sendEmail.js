import nodemailer from 'nodemailer';

export default async function sendEmail({ to, subject, html }) {
  const { BREVO_API_KEY, EMAIL_FROM, EMAIL_USER, EMAIL_PASS, NODE_ENV } = process.env;

  // Production (Render): Brevo HTTP API, kyunki Render free par SMTP block hai
  if (BREVO_API_KEY) {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'ShramSetu', email: EMAIL_FROM },
        to: [{ email: to }],
        subject,
        htmlContent: html
      })
    });
    if (!res.ok) throw new Error(`Brevo error ${res.status}: ${await res.text()}`);
    return;
  }

  // Local: Gmail SMTP
  if (EMAIL_USER && EMAIL_PASS) {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL_USER, pass: EMAIL_PASS } });
    await transporter.sendMail({ from: `"ShramSetu" <${EMAIL_USER}>`, to, subject, html });
    return;
  }

  if (NODE_ENV !== 'production') {
    console.log(`\n[DEV EMAIL] To: ${to}\nSubject: ${subject}\n${html}\n`);
    return;
  }
  throw new Error('Email is not configured on the server.');
}
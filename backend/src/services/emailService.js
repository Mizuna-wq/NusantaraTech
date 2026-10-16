import nodemailer from 'nodemailer';
import {
  applicationSubmittedEmail,
  statusChangedEmail,
  EMAIL_STATUSES,
} from './emailTemplates.js';

let transporter = null;

// Kredensial SMTP dibaca dari .env. Jika belum diisi, email dilewati (aplikasi tetap jalan).
function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

// Fungsi ini tidak pernah melempar error: gagal kirim email tidak boleh menggagalkan lamaran.
async function sendEmail(to, { subject, html }) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn(`SMTP belum dikonfigurasi, email "${subject}" ke ${to} tidak dikirim`);
    return;
  }
  try {
    await mailer.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
  } catch (err) {
    console.error('Gagal mengirim email:', err.message);
  }
}

const applicationUrl = (id) =>
  `${process.env.CLIENT_URL || 'http://localhost:5173'}/candidate/applications/${id}`;

export function sendApplicationSubmitted({ to, name, jobTitle, applicationId }) {
  return sendEmail(
    to,
    applicationSubmittedEmail({ name, jobTitle, url: applicationUrl(applicationId) })
  );
}

export function sendStatusChanged({ to, name, jobTitle, status, note, applicationId }) {
  if (!EMAIL_STATUSES.includes(status)) return Promise.resolve();
  return sendEmail(
    to,
    statusChangedEmail({ name, jobTitle, status, note, url: applicationUrl(applicationId) })
  );
}

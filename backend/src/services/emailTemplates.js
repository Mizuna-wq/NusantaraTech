import { escapeHtml } from '../utils/html.js';
import { COMPANY_NAME } from '../utils/constants.js';

// Template email sederhana: satu kolom, tanpa dekorasi.
function layout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="id">
<body style="margin:0;padding:24px;background:#fafaf8;font-family:Arial,Helvetica,sans-serif;color:#181818;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:6px;padding:32px;">
    <p style="margin:0 0 24px;font-size:18px;font-weight:bold;color:#2563eb;">${COMPANY_NAME}</p>
    <h1 style="margin:0 0 16px;font-size:20px;">${escapeHtml(title)}</h1>
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0 16px;">
    <p style="margin:0;font-size:12px;color:#666666;">Email ini dikirim otomatis oleh sistem karir ${COMPANY_NAME}. Mohon tidak membalas email ini.</p>
  </div>
</body>
</html>`;
}

function link(url, label) {
  return `<p style="margin:24px 0 0;"><a href="${escapeHtml(url)}" style="color:#2563eb;">${escapeHtml(label)}</a></p>`;
}

function noteBlock(note) {
  if (!note) return '';
  return `<p style="margin:16px 0 0;padding:12px;background:#fafaf8;border-left:3px solid #2563eb;"><strong>Catatan dari tim HR:</strong><br>${escapeHtml(note)}</p>`;
}

export function applicationSubmittedEmail({ name, jobTitle, url }) {
  return {
    subject: `Lamaran Anda untuk ${jobTitle} telah kami terima`,
    html: layout(
      'Lamaran berhasil dikirim',
      `<p>Halo ${escapeHtml(name)},</p>
       <p>Terima kasih telah melamar posisi <strong>${escapeHtml(jobTitle)}</strong> di ${COMPANY_NAME}. Lamaran Anda sudah kami terima dan akan ditinjau oleh tim HR.</p>
       <p>Anda dapat memantau perkembangan lamaran kapan saja melalui akun Anda.</p>
       ${link(url, 'Lihat status lamaran')}`
    ),
  };
}

const STATUS_CONTENT = {
  interview: {
    title: 'Anda diundang ke tahap interview',
    subject: (job) => `Undangan interview untuk posisi ${job}`,
    text: (job) =>
      `<p>Kabar baik. Lamaran Anda untuk posisi <strong>${job}</strong> telah lolos ke tahap <strong>Interview</strong>. Tim HR akan menghubungi Anda untuk mengatur jadwalnya.</p>`,
  },
  accepted: {
    title: 'Selamat, lamaran Anda diterima',
    subject: (job) => `Selamat! Lamaran Anda untuk ${job} diterima`,
    text: (job) =>
      `<p>Selamat. Anda dinyatakan <strong>diterima</strong> untuk posisi <strong>${job}</strong>. Tim HR akan segera menghubungi Anda mengenai langkah berikutnya.</p>`,
  },
  rejected: {
    title: 'Update lamaran Anda',
    subject: (job) => `Update lamaran Anda untuk posisi ${job}`,
    text: (job) =>
      `<p>Terima kasih atas waktu dan minat Anda melamar posisi <strong>${job}</strong>. Setelah mempertimbangkan dengan seksama, kami memutuskan untuk tidak melanjutkan proses lamaran Anda saat ini. Kami menghargai usaha Anda dan berharap Anda tertarik melamar posisi lain di ${COMPANY_NAME}.</p>`,
  },
};

// Status yang memicu email. Status lain (screening, technical test) tidak mengirim email.
export const EMAIL_STATUSES = Object.keys(STATUS_CONTENT);

export function statusChangedEmail({ name, jobTitle, status, note, url }) {
  const content = STATUS_CONTENT[status];
  const safeJob = escapeHtml(jobTitle);
  return {
    subject: content.subject(jobTitle),
    html: layout(
      content.title,
      `<p>Halo ${escapeHtml(name)},</p>
       ${content.text(safeJob)}
       ${noteBlock(note)}
       ${link(url, 'Lihat detail lamaran')}`
    ),
  };
}

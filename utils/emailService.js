const HOSTINGER_API = 'https://api.mail.hostinger.com/api/v1';

function headers() {
  return {
    Authorization: `Bearer ${process.env.HOSTINGER_MAIL_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function sendEmail({ to, subject, html, text }) {
  try {
    const res = await fetch(
      `${HOSTINGER_API}/mailboxes/${process.env.HOSTINGER_MAILBOX_ID}/send`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ to: [to], displayName: 'ADQS', subject, html, text }),
      }
    );
    return res.status === 204;
  } catch (err) {
    console.error('[email] send error:', err.message);
    return false;
  }
}

// ── Templates ────────────────────────────────────────────────────────────────

function otpEmail(code) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <div style="background:#1a1a2e;padding:20px 24px;border-radius:6px 6px 0 0;">
        <h2 style="color:#fff;margin:0;font-size:18px;">ADQS — Email Verification</h2>
      </div>
      <div style="background:#fff;padding:32px 24px;border-radius:0 0 6px 6px;border:1px solid #e0e0e0;text-align:center;">
        <p style="color:#444;margin:0 0 24px;">Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
        <div style="display:inline-block;background:#f4f4f4;border-radius:8px;padding:16px 40px;font-size:36px;font-weight:700;letter-spacing:10px;color:#1a1a2e;">${code}</div>
        <p style="color:#999;font-size:12px;margin:24px 0 0;">If you did not request this, you can safely ignore this email.</p>
      </div>
    </div>`;
  const text = `ADQS Email Verification\n\nYour verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, ignore this email.`;
  return { html, text };
}

function adminNotificationEmail({ name, email, phone, organisation, area_of_enquiry, message, email_verified }) {
  const verifiedBadge = email_verified
    ? `<span style="background:#d4edda;color:#155724;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;">✓ Verified</span>`
    : `<span style="background:#fff3cd;color:#856404;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;">✗ Unverified</span>`;

  const replySubject = encodeURIComponent(`Re: Your ADQS Enquiry — ${area_of_enquiry}`);
  const replyBody = encodeURIComponent(`Dear ${name},\n\nThank you for your enquiry regarding ${area_of_enquiry}.\n\n`);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#1a1a2e;padding:20px 24px;border-radius:6px 6px 0 0;">
        <h2 style="color:#fff;margin:0;font-size:18px;">New Enquiry — ADQS Website</h2>
      </div>
      <div style="background:#fff;padding:24px;border-radius:0 0 6px 6px;border:1px solid #e0e0e0;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#666;width:150px;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a> &nbsp;${verifiedBadge}</td></tr>
          ${phone ? `<tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${phone}</td></tr>` : ''}
          ${organisation ? `<tr><td style="padding:8px 0;color:#666;">Organisation</td><td style="padding:8px 0;">${organisation}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#666;">Area of Enquiry</td><td style="padding:8px 0;">${area_of_enquiry}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
        <p style="color:#666;font-size:13px;margin:0 0 8px;">Message:</p>
        <p style="margin:0 0 24px;white-space:pre-wrap;font-size:14px;">${message}</p>
        <a href="mailto:${email}?subject=${replySubject}&body=${replyBody}"
           style="display:inline-block;background:#1a1a2e;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:8px;margin-bottom:2px;"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
          Reply to ${name}
        </a>
      </div>
    </div>`;

  const text = `New Enquiry — ADQS Website\n\nName: ${name}\nEmail: ${email} [${email_verified ? 'Verified' : 'Unverified'}]${phone ? `\nPhone: ${phone}` : ''}${organisation ? `\nOrganisation: ${organisation}` : ''}\nArea of Enquiry: ${area_of_enquiry}\n\nMessage:\n${message}\n\nReply directly: ${email}`;

  return { html, text };
}

function clientAcknowledgementEmail(name) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#1a1a2e;padding:20px 24px;border-radius:6px 6px 0 0;">
        <h2 style="color:#fff;margin:0;font-size:18px;">Thank you for reaching out — ADQS</h2>
      </div>
      <div style="background:#fff;padding:32px 24px;border-radius:0 0 6px 6px;border:1px solid #e0e0e0;">
        <p style="color:#444;margin:0 0 16px;">Dear ${name},</p>
        <p style="color:#444;margin:0 0 16px;">Thank you for your enquiry. We have received your message and a member of our team will be in touch with you shortly.</p>
        <p style="color:#444;margin:0 0 24px;">If your matter is urgent, please contact us directly:</p>
        <table style="font-size:14px;color:#444;">
          <tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td>info@adqs.co.za</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#666;">Website</td><td><a href="https://adqs.co.za">adqs.co.za</a></td></tr>
        </table>
        <p style="color:#999;font-size:12px;margin:32px 0 0;">Adequate Strategies (Pty) Ltd &mdash; Legal Consulting &amp; Advisory</p>
      </div>
    </div>`;

  const text = `Dear ${name},\n\nThank you for your enquiry. We have received your message and a member of our team will be in touch with you shortly.\n\nIf your matter is urgent, please contact us directly:\nEmail: info@adqs.co.za\nWebsite: adqs.co.za\n\nAdequate Strategies (Pty) Ltd — Legal Consulting & Advisory`;

  return { html, text };
}

module.exports = { sendEmail, otpEmail, adminNotificationEmail, clientAcknowledgementEmail };

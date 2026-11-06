const db = require('../models/supabaseModel');
const { sanitizeFields } = require('../utils/sanitize');
const { sendEmail, otpEmail, adminNotificationEmail, clientAcknowledgementEmail } = require('../utils/emailService');

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

exports.sendOtp = async (req, res) => {
  try {
    let { email } = req.body;
    ({ email } = sanitizeFields(req.body, ['email']));

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ status: 'error', message: 'Valid email is required.' });

    await db.deleteExpiredOtps(email);

    const existing = await db.getRecentOtp(email);
    if (existing) {
      const secondsSince = (Date.now() - new Date(existing.created_at).getTime()) / 1000;
      if (secondsSince < 60)
        return res.status(429).json({ status: 'error', message: 'Please wait before requesting a new code.', retryAfter: Math.ceil(60 - secondsSince) });
    }

    const code = generateOtp();
    const { error } = await db.createOtp(email, code);
    if (error) return res.status(500).json({ status: 'error', message: 'Failed to create verification code.' });

    const { html, text } = otpEmail(code);
    const sent = await sendEmail({ to: email, subject: 'Your ADQS verification code', html, text });
    if (!sent) return res.status(500).json({ status: 'error', message: 'Failed to send verification email.' });

    res.json({ status: 'success', message: 'Verification code sent.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    let { email, code } = req.body;
    ({ email, code } = sanitizeFields(req.body, ['email', 'code']));

    if (!email || !code)
      return res.status(400).json({ status: 'error', message: 'Email and code are required.' });

    const record = await db.getRecentOtp(email);
    if (!record) return res.status(410).json({ status: 'error', message: 'Code expired or not found. Please request a new one.' });

    const attempts = await db.incrementOtpAttempts(record.id);
    if (attempts > 5) {
      await db.deleteOtp(record.id);
      return res.status(429).json({ status: 'error', message: 'Too many incorrect attempts. Please request a new code.' });
    }

    if (record.code !== code)
      return res.status(401).json({ status: 'error', message: 'Incorrect code.' });

    await db.deleteOtp(record.id);
    res.json({ status: 'success', verified: true });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.submit = async (req, res) => {
  try {
    let { name, email, phone, organisation, area_of_enquiry, message, email_verified } = req.body;
    ({ name, email, phone, organisation, area_of_enquiry, message } =
      sanitizeFields(req.body, ['name', 'email', 'phone', 'organisation', 'area_of_enquiry', 'message']));

    if (!name) return res.status(400).json({ status: 'error', message: 'Name is required.' });
    if (!email) return res.status(400).json({ status: 'error', message: 'Email is required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ status: 'error', message: 'Invalid email address.' });
    if (!area_of_enquiry) return res.status(400).json({ status: 'error', message: 'Area of enquiry is required.' });
    if (!message) return res.status(400).json({ status: 'error', message: 'Message is required.' });

    const verified = email_verified === true || email_verified === 'true';

    const { data, error } = await db.createEnquiry({
      name, email,
      phone: phone || null,
      organisation: organisation || null,
      area_of_enquiry, message,
      status: 'New',
      email_verified: verified,
    });
    if (error) return res.status(500).json({ status: 'error', message: error.message });

    // Fire emails non-blocking
    const { html: adminHtml, text: adminText } = adminNotificationEmail({ name, email, phone, organisation, area_of_enquiry, message, email_verified: verified });
    sendEmail({
      to: process.env.CONTACT_NOTIFY_EMAIL,
      subject: `New Enquiry: ${area_of_enquiry} — ${name}`,
      html: adminHtml,
      text: adminText,
    }).catch((err) => console.error('[contact] admin notification failed:', err.message));

    if (verified) {
      const { html: ackHtml, text: ackText } = clientAcknowledgementEmail(name);
      sendEmail({
        to: email,
        subject: 'We\'ve received your enquiry — ADQS',
        html: ackHtml,
        text: ackText,
      }).catch((err) => console.error('[contact] client acknowledgement failed:', err.message));
    }

    res.status(201).json({ status: 'success', message: 'Enquiry received.', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const { data, error, count } = await db.getEnquiries({ status, search, page: +page, limit: +limit });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data, count });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['New', 'Read', 'Replied'].includes(status))
      return res.status(400).json({ status: 'error', message: 'Invalid status.' });
    const { data, error } = await db.updateEnquiryStatus(req.params.id, status);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { error } = await db.deleteEnquiry(req.params.id);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', message: 'Enquiry deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

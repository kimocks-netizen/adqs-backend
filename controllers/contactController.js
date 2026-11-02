const db = require('../models/supabaseModel');

exports.submit = async (req, res) => {
  try {
    const { name, email, phone, organisation, area_of_enquiry, message } = req.body;
    if (!name?.trim()) return res.status(400).json({ status: 'error', message: 'Name is required.' });
    if (!email?.trim()) return res.status(400).json({ status: 'error', message: 'Email is required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ status: 'error', message: 'Invalid email address.' });
    if (!area_of_enquiry?.trim()) return res.status(400).json({ status: 'error', message: 'Area of enquiry is required.' });
    if (!message?.trim()) return res.status(400).json({ status: 'error', message: 'Message is required.' });

    const { data, error } = await db.createEnquiry({ name, email, phone: phone || null, organisation: organisation || null, area_of_enquiry, message, status: 'New' });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
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

const db = require('../models/supabaseModel');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: 'error', message: 'No file provided.' });
    if (!ALLOWED_TYPES.includes(req.file.mimetype))
      return res.status(400).json({ status: 'error', message: 'Only JPG, PNG and WebP allowed.' });

    const ext = req.file.originalname.split('.').pop();
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { url, error } = await db.uploadFile(req.file.buffer, path, req.file.mimetype);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', url });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Upload failed.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { path } = req.body;
    if (!path) return res.status(400).json({ status: 'error', message: 'File path required.' });
    const { error } = await db.deleteFile(path);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', message: 'File deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Delete failed.' });
  }
};

const db = require('../models/supabaseModel');

exports.getFolders = async (req, res) => {
  try {
    const { data, error } = await db.getFolders();
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.createFolder = async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    if (!name) return res.status(400).json({ status: 'error', message: 'Folder name required.' });
    const { data, error } = await db.createFolder({ name, parent_id: parent_id || null });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.removeFolder = async (req, res) => {
  try {
    const { error } = await db.deleteFolder(req.params.id);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', message: 'Folder deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { folder_id } = req.query;
    const { data, error } = await db.getDocuments({ folder_id });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { data, error } = await db.getDocumentById(req.params.id);
    if (error || !data) return res.status(404).json({ status: 'error', message: 'Document not found.' });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { folder_id, title, type, body, status, watermark } = req.body;
    if (!folder_id || !title || !type) return res.status(400).json({ status: 'error', message: 'folder_id, title and type required.' });
    const now = new Date().toISOString();
    const { data, error } = await db.createDocument({ folder_id, title, type, body, status: status || 'Draft', watermark: watermark ?? false, created_at: now, updated_at: now });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { data, error } = await db.updateDocument(req.params.id, { ...req.body, updated_at: new Date().toISOString() });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { error } = await db.deleteDocument(req.params.id);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', message: 'Document deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

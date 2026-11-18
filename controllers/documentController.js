const db = require('../models/supabaseModel');
const { sanitizeFields } = require('../utils/sanitize');

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
    const { name, parent_id } = sanitizeFields(req.body, ['name']);
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
    const { folder_id, page = 1, limit = 10 } = req.query;
    const { data, error, count } = await db.getDocuments({ folder_id, page: +page, limit: +limit });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data, count });
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
    const { folder_id, type, status, watermark, document_date } = req.body;
    const { title, body } = sanitizeFields(req.body, ['title']);
    if (!folder_id || !title || !type) return res.status(400).json({ status: 'error', message: 'folder_id, title and type required.' });
    const now = new Date().toISOString();
    const { data, error } = await db.createDocument({ folder_id, title, type, body, status: status || 'Draft', watermark: watermark ?? false, document_date: document_date || new Date().toISOString().slice(0,10), created_at: now, updated_at: now });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title } = sanitizeFields(req.body, ['title']);
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    if (title) updates.title = title;
    const { data, error } = await db.updateDocument(req.params.id, updates);
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

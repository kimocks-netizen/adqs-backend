const db = require('../models/supabaseModel');

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

exports.getAll = async (req, res) => {
  try {
    const { data, error } = await db.getCategories();
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ status: 'error', message: 'Name is required.' });
    const { data, error } = await db.createCategory({ name, slug: toSlug(name) });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    const updates = { name };
    if (name) updates.slug = toSlug(name);
    const { data, error } = await db.updateCategory(req.params.id, updates);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { error } = await db.deleteCategory(req.params.id);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

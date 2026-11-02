const db = require('../models/supabaseModel');

exports.getActive = async (req, res) => {
  try {
    const { data, error } = await db.getActiveServices();
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const { data, error } = await db.getServiceBySlug(req.params.slug);
    if (error || !data) return res.status(404).json({ status: 'error', message: 'Service not found.' });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { data, error } = await db.getAllServicesAdmin();
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, slug, summary, intro, areas, icon, is_active } = req.body;
    if (!title || !slug) return res.status(400).json({ status: 'error', message: 'Title and slug required.' });
    const { data, error } = await db.createService({ title, slug, summary, intro, areas, icon, is_active: is_active ?? true });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { data, error } = await db.updateService(req.params.id, req.body);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { error } = await db.deleteService(req.params.id);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', message: 'Service deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

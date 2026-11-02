const db = require('../models/supabaseModel');

exports.logPageView = async (req, res) => {
  try {
    const { path, referrer } = req.body;
    if (!path) return res.status(400).json({ status: 'error', message: 'Path required.' });
    await db.logPageView(path, referrer);
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.logArticleClick = async (req, res) => {
  try {
    const { article_id } = req.body;
    if (!article_id) return res.status(400).json({ status: 'error', message: 'article_id required.' });
    await db.logArticleClick(article_id);
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.logServiceView = async (req, res) => {
  try {
    const { service_slug } = req.body;
    if (!service_slug) return res.status(400).json({ status: 'error', message: 'service_slug required.' });
    await db.logServiceView(service_slug);
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const data = await db.getAnalyticsSummary();
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.getTopArticles = async (req, res) => {
  try {
    const { data, error } = await db.getTopArticles(5);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.getTopServices = async (req, res) => {
  try {
    const { data, error } = await db.getTopServices(6);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

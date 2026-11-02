const db = require('../models/supabaseModel');

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

exports.getPublished = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const { data, error, count } = await db.getPublishedArticles({ category, search, page: +page, limit: +limit });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data, count });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const { data, error } = await db.getArticleBySlug(req.params.slug);
    if (error || !data) return res.status(404).json({ status: 'error', message: 'Article not found.' });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const { data, error, count } = await db.getAllArticlesAdmin({ search, status, page: +page, limit: +limit });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data, count });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { data, error } = await db.getArticleByIdAdmin(req.params.id);
    if (error || !data) return res.status(404).json({ status: 'error', message: 'Article not found.' });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, introduction, body, featured_image_url, category, author, status, seo_title, seo_description } = req.body;
    if (!title) return res.status(400).json({ status: 'error', message: 'Title is required.' });
    if (title.length > 70) return res.status(400).json({ status: 'error', message: 'Title must be 70 characters or less.' });

    let slug = toSlug(title);
    let suffix = 0;
    while (await db.slugExists(slug)) { suffix++; slug = `${toSlug(title)}-${suffix}`; }

    const now = new Date().toISOString();
    const { data, error } = await db.createArticle({
      title, slug, introduction, body, featured_image_url, category,
      author: author || 'Bright Ngwenyama Gunde',
      status: status || 'draft',
      hidden: false,
      published_at: status === 'published' ? now : null,
      seo_title, seo_description,
      created_at: now, updated_at: now,
    });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, introduction, body, featured_image_url, category, author, status, hidden, seo_title, seo_description } = req.body;
    if (title && title.length > 70) return res.status(400).json({ status: 'error', message: 'Title must be 70 characters or less.' });

    const updates = { introduction, body, featured_image_url, category, author, status, hidden, seo_title, seo_description, updated_at: new Date().toISOString() };
    if (title) {
      updates.title = title;
      let slug = toSlug(title);
      let suffix = 0;
      while (await db.slugExists(slug, req.params.id)) { suffix++; slug = `${toSlug(title)}-${suffix}`; }
      updates.slug = slug;
    }
    if (status === 'published') updates.published_at = new Date().toISOString();

    const { data, error } = await db.updateArticle(req.params.id, updates);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { error } = await db.deleteArticle(req.params.id);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', message: 'Article deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

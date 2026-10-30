const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/articleController');

// Public
router.get('/articles', c.getPublished);
router.get('/articles/:slug', c.getBySlug);

// Protected
router.get('/admin/articles', auth, c.getAll);
router.get('/admin/articles/:id', auth, c.getById);
router.post('/admin/articles', auth, c.create);
router.put('/admin/articles/:id', auth, c.update);
router.delete('/admin/articles/:id', auth, c.remove);

module.exports = router;

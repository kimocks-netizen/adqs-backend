const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/analyticsController');

router.post('/analytics/pageview', c.logPageView);
router.post('/analytics/article-click', c.logArticleClick);
router.post('/analytics/service-view', c.logServiceView);
router.get('/admin/analytics/summary', auth, c.getSummary);
router.get('/admin/analytics/top-articles', auth, c.getTopArticles);
router.get('/admin/analytics/top-services', auth, c.getTopServices);

module.exports = router;

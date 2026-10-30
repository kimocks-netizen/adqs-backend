const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/serviceController');

router.get('/services', c.getActive);
router.get('/services/:slug', c.getBySlug);
router.get('/admin/services', auth, c.getAll);
router.post('/admin/services', auth, c.create);
router.put('/admin/services/:id', auth, c.update);
router.delete('/admin/services/:id', auth, c.remove);

module.exports = router;

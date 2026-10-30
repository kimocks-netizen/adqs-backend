const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/categoryController');

router.get('/categories', c.getAll);
router.post('/admin/categories', auth, c.create);
router.put('/admin/categories/:id', auth, c.update);
router.delete('/admin/categories/:id', auth, c.remove);

module.exports = router;

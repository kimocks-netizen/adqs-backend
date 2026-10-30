const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/contactController');

router.post('/contact', c.submit);
router.get('/admin/contact', auth, c.getAll);
router.put('/admin/contact/:id/status', auth, c.updateStatus);
router.delete('/admin/contact/:id', auth, c.remove);

module.exports = router;

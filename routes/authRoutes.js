const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/admin/login', c.login);
router.put('/admin/change-password', auth, c.changePassword);

module.exports = router;

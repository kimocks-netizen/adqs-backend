const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const c = require('../controllers/contactController');

const otpSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { status: 'error', message: 'Too many verification requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpVerifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { status: 'error', message: 'Too many verification attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/contact/send-otp', otpSendLimiter, c.sendOtp);
router.post('/contact/verify-otp', otpVerifyLimiter, c.verifyOtp);
router.post('/contact', c.submit);
router.get('/admin/contact', auth, c.getAll);
router.put('/admin/contact/:id/status', auth, c.updateStatus);
router.delete('/admin/contact/:id', auth, c.remove);

module.exports = router;

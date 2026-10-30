const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const c = require('../controllers/uploadController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/admin/upload', auth, upload.single('file'), c.upload);
router.delete('/admin/upload', auth, c.remove);

module.exports = router;

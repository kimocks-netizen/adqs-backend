const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/documentController');

router.get('/admin/document-folders', auth, c.getFolders);
router.post('/admin/document-folders', auth, c.createFolder);
router.delete('/admin/document-folders/:id', auth, c.removeFolder);

router.get('/admin/documents', auth, c.getAll);
router.get('/admin/documents/:id', auth, c.getById);
router.post('/admin/documents', auth, c.create);
router.put('/admin/documents/:id', auth, c.update);
router.delete('/admin/documents/:id', auth, c.remove);

module.exports = router;

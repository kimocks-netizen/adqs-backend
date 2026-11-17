const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/admin/invoices',              invoiceController.createInvoice);
router.get('/admin/invoices',               invoiceController.getAllInvoices);
router.get('/admin/invoices/:id',           invoiceController.getInvoiceById);
router.put('/admin/invoices/:id',           invoiceController.updateInvoice);
router.post('/admin/invoices/:id/convert',  invoiceController.convertDocument);
router.delete('/admin/invoices/:id',        invoiceController.deleteInvoice);

module.exports = router;

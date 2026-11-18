const db = require('../models/supabaseModel');
const { sanitizeFields } = require('../utils/sanitize');

module.exports = {
  async createInvoice(req, res) {
    try {
      const sanitized = sanitizeFields(req.body, ['customer_name', 'customer_email', 'customer_phone', 'matter_reference', 'notes']);
      const {
        document_type = 'invoice',
        invoice_date, due_date, items = [],
      } = req.body;
      const { customer_name, customer_email, customer_phone, matter_reference, notes } = sanitized;

      if (!customer_name) return res.status(400).json({ status: 'error', message: 'customer_name is required' });
      if (!invoice_date)  return res.status(400).json({ status: 'error', message: 'invoice_date is required' });
      if (customer_name.length > 100) return res.status(400).json({ status: 'error', message: 'customer_name must be 100 characters or less.' });
      if (customer_phone && customer_phone.length > 20) return res.status(400).json({ status: 'error', message: 'customer_phone must be 20 characters or less.' });
      if (matter_reference && matter_reference.length > 50) return res.status(400).json({ status: 'error', message: 'matter_reference must be 50 characters or less.' });
      if (notes && notes.length > 1000) return res.status(400).json({ status: 'error', message: 'notes must be 1000 characters or less.' });
      if (items.some((i: {description: string}) => i.description?.length > 300)) return res.status(400).json({ status: 'error', message: 'Item description must be 300 characters or less.' });

      const invoice_number = document_type === 'quote'
        ? await db.generateQuoteNumber()
        : await db.generateInvoiceNumber();

      const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

      const invoiceData = {
        invoice_number, document_type,
        customer_name, customer_email: customer_email || null,
        customer_phone: customer_phone || null,
        matter_reference: matter_reference || null,
        invoice_date,
        due_date: due_date || null,
        subtotal, total_amount: subtotal,
        status: 'draft',
        notes: notes || null,
      };

      const { data, error } = await db.createInvoice(invoiceData, items);
      if (error) return res.status(500).json({ status: 'error', message: error.message });

      res.json({ status: 'success', message: `${document_type === 'quote' ? 'Quote' : 'Invoice'} created!`, data: data[0] });
    } catch (err) {
      console.error('createInvoice error:', err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async getAllInvoices(req, res) {
    try {
      const { page = 1, limit = 20, type, status, search } = req.query;
      const { data, error, count } = await db.getInvoices({
        page: parseInt(page), limit: parseInt(limit), type, status, search,
      });
      if (error) return res.status(500).json({ status: 'error', message: error.message });
      res.json({ status: 'success', data, total: count, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) {
      console.error('getAllInvoices error:', err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async getInvoiceById(req, res) {
    try {
      const { data, error } = await db.getInvoiceById(req.params.id);
      if (error) return res.status(500).json({ status: 'error', message: error.message });
      if (!data)  return res.status(404).json({ status: 'error', message: 'Not found' });
      res.json({ status: 'success', data });
    } catch (err) {
      console.error('getInvoiceById error:', err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async updateInvoice(req, res) {
    try {
      const { items, ...rest } = req.body;
      const fields = sanitizeFields(rest, ['customer_name', 'customer_email', 'customer_phone', 'matter_reference', 'notes']);

      // Recalculate totals if items are being updated
      if (items) {
        const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
        fields.subtotal = subtotal;
        fields.total_amount = subtotal;
      }

      const { data, error } = await db.updateInvoice(req.params.id, fields);
      if (error) return res.status(500).json({ status: 'error', message: error.message });

      if (items) await db.replaceInvoiceItems(req.params.id, items);

      res.json({ status: 'success', message: 'Updated successfully!', data: data[0] });
    } catch (err) {
      console.error('updateInvoice error:', err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async convertDocument(req, res) {
    try {
      const { newType } = req.body;
      if (!['invoice', 'quote'].includes(newType)) {
        return res.status(400).json({ status: 'error', message: 'Invalid document type' });
      }
      const { data, error } = await db.convertDocument(req.params.id, newType);
      if (error) return res.status(500).json({ status: 'error', message: error.message });
      res.json({ status: 'success', message: `Converted to ${newType}!`, data });
    } catch (err) {
      console.error('convertDocument error:', err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async deleteInvoice(req, res) {
    try {
      const { error } = await db.deleteInvoice(req.params.id);
      if (error) return res.status(500).json({ status: 'error', message: error.message });
      res.json({ status: 'success', message: 'Deleted successfully!' });
    } catch (err) {
      console.error('deleteInvoice error:', err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },
};

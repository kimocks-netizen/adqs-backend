const stub = (name) => (req, res) => res.json({ status: 'success', message: `${name} — not yet implemented` });
exports.submit       = stub('contact.submit');
exports.getAll       = stub('contact.getAll');
exports.updateStatus = stub('contact.updateStatus');
exports.remove       = stub('contact.remove');

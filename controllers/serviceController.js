const stub = (name) => (req, res) => res.json({ status: 'success', message: `${name} — not yet implemented` });
exports.getActive  = stub('services.getActive');
exports.getBySlug  = stub('services.getBySlug');
exports.getAll     = stub('services.getAll');
exports.create     = stub('services.create');
exports.update     = stub('services.update');
exports.remove     = stub('services.remove');

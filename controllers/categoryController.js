const stub = (name) => (req, res) => res.json({ status: 'success', message: `${name} — not yet implemented` });
exports.getAll = stub('categories.getAll');
exports.create = stub('categories.create');
exports.update = stub('categories.update');
exports.remove = stub('categories.remove');

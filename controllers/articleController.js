// Stub — implement per phase
const stub = (name) => (req, res) => res.json({ status: 'success', message: `${name} — not yet implemented` });

exports.getPublished   = stub('articles.getPublished');
exports.getBySlug      = stub('articles.getBySlug');
exports.getAll         = stub('articles.getAll');
exports.getById        = stub('articles.getById');
exports.create         = stub('articles.create');
exports.update         = stub('articles.update');
exports.remove         = stub('articles.remove');

const stub = (name) => (req, res) => res.json({ status: 'success', message: `${name} — not yet implemented` });
exports.getFolders    = stub('documents.getFolders');
exports.createFolder  = stub('documents.createFolder');
exports.removeFolder  = stub('documents.removeFolder');
exports.getAll        = stub('documents.getAll');
exports.getById       = stub('documents.getById');
exports.create        = stub('documents.create');
exports.update        = stub('documents.update');
exports.remove        = stub('documents.remove');

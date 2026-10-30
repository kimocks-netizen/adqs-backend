const stub = (name) => (req, res) => res.json({ status: 'success', message: `${name} — not yet implemented` });
exports.upload = stub('upload.upload');
exports.remove = stub('upload.remove');

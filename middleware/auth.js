const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'No token provided.' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId    = decoded.id;
    req.adminEmail = decoded.email;
    req.adminRole  = decoded.role;
    next();
  } catch {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
  }
};

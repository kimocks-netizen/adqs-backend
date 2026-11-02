const { supabase } = require('../models/supabaseModel');

module.exports = async (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ status: 'error', message: 'No token provided.' });

  const token = header.split(' ')[1];

  try {
    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user)
      return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });

    req.adminId    = user.id;
    req.adminEmail = user.email;
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
  }
};

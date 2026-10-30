const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../models/supabase');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ status: 'error', message: 'Email and password required.' });

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !admin)
    return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid)
    return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ status: 'success', data: { token, name: admin.name, role: admin.role } });
};

exports.changePassword = async (req, res) => {
  // TODO: implement in Phase 3
  res.json({ status: 'success', message: 'Password changed.' });
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/supabaseModel');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ status: 'error', message: 'Email and password required.' });
  try {
    const { data: admin, error } = await db.getAdminByEmail(email);
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
    res.json({ status: 'success', token, data: { name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ status: 'error', message: 'Both passwords required.' });
  try {
    const { data: admin } = await db.getAdminById(req.adminId);
    if (!admin) return res.status(404).json({ status: 'error', message: 'Admin not found.' });

    const valid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!valid) return res.status(401).json({ status: 'error', message: 'Current password incorrect.' });

    const password_hash = await bcrypt.hash(newPassword, 10);
    await db.updateAdminPassword(req.adminId, password_hash);
    res.json({ status: 'success', message: 'Password updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

const { supabase } = require('../models/supabaseModel');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ status: 'error', message: 'Email and password required.' });

    const response = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const result = await response.json();

    if (!result.access_token)
      return res.status(401).json({ status: 'error', message: result.error_description || 'Invalid credentials.' });

    const { data: admin } = await supabase
      .from('admins')
      .select('name, role')
      .eq('email', email.toLowerCase())
      .single();

    return res.json({
      status: 'success',
      token: result.access_token,
      refresh_token: result.refresh_token,
      data: {
        email: result.user.email,
        name: admin?.name ?? 'Administrator',
        role: admin?.role ?? 'administrator',
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword)
      return res.status(400).json({ status: 'error', message: 'New password required.' });
    const { error } = await supabase.auth.admin.updateUserById(req.adminId, { password: newPassword });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', message: 'Password updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

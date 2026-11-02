const { supabase, supabaseAuth } = require('../models/supabaseModel');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ status: 'error', message: 'Email and password required.' });

  try {
    // Sign in via Supabase Auth
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (error || !data?.session)
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });

    // Fetch admin profile from admins table
    const { data: admin } = await supabase
      .from('admins')
      .select('name, role')
      .eq('email', email.toLowerCase())
      .single();

    res.json({
      status: 'success',
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      data: {
        email: data.user.email,
        name: admin?.name ?? 'Administrator',
        role: admin?.role ?? 'administrator',
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

exports.changePassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword)
    return res.status(400).json({ status: 'error', message: 'New password required.' });
  try {
    // Use service key to update password for the authenticated user
    const { error } = await supabase.auth.admin.updateUserById(req.adminId, { password: newPassword });
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'success', message: 'Password updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

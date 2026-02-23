import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

export const showRegister = (req, res) => {
  if (res.locals.currentUser) return res.redirect('/');
  res.render('auth/register', { title: 'Begin Your Apprenticeship — ThinkNote', error: null, values: {} });
};

export const register = async (req, res) => {
  const { username, email, password, displayName } = req.body;
  try {
    if (!username || !email || !password || !displayName) throw new Error('All fields are required.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) throw new Error('Username or email already taken.');

    const verifyToken = crypto.randomBytes(32).toString('hex');
    await User.create({
      username, email, displayName,
      passwordHash: password,
      verifyToken,
      verifyTokenExp: Date.now() + 24 * 60 * 60 * 1000,
    });
    console.log(`[DEV] Verify URL: ${process.env.BASE_URL}/auth/verify/${verifyToken}`);
    res.render('auth/register-success', { title: 'Credential Validation — ThinkNote', email });
  } catch (err) {
    res.render('auth/register', { title: 'Begin Your Apprenticeship — ThinkNote', error: err.message, values: req.body });
  }
};

export const showLogin = (req, res) => {
  if (res.locals.currentUser) return res.redirect('/');
  res.render('auth/login', { title: 'Enter the Workshop — ThinkNote', error: null });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) throw new Error('Invalid email or password.');
    if (user.isSuspended) throw new Error('This account has been suspended.');

    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.cookie('token', token, {
      httpOnly: true, sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect('/');
  } catch (err) {
    res.render('auth/login', { title: 'Enter the Workshop — ThinkNote', error: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};

export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verifyToken: req.params.token,
      verifyTokenExp: { $gt: Date.now() },
    });
    if (!user) return res.render('error', { message: 'Credential validation window has closed. Please re-verify.', code: 400 });
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExp = undefined;
    await user.save();
    res.render('auth/verified', { title: 'Credentials Validated — ThinkNote' });
  } catch (err) {
    res.render('error', { message: 'Something went wrong.', code: 500 });
  }
};

export const showForgotPassword = (req, res) => {
  res.render('auth/forgot-password', { title: 'Recover Credentials — ThinkNote', message: null, error: null });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetToken = resetToken;
      user.resetTokenExp = Date.now() + 1 * 60 * 60 * 1000;
      await user.save();
      console.log(`[DEV] Reset URL: ${process.env.BASE_URL}/auth/reset-password/${resetToken}`);
    }
    res.render('auth/forgot-password', {
      title: 'Recover Credentials — ThinkNote',
      message: 'If that email exists in our records, a recovery link has been sent.',
      error: null,
    });
  } catch (err) {
    res.render('auth/forgot-password', { title: 'Recover Credentials — ThinkNote', message: null, error: 'Structural error. Please try again later.' });
  }
};

export const showResetPassword = async (req, res) => {
  const user = await User.findOne({ resetToken: req.params.token, resetTokenExp: { $gt: Date.now() } });
  if (!user) return res.render('error', { message: 'Credential reset window has closed.', code: 400 });
  res.render('auth/reset-password', { title: 'Update Credentials — ThinkNote', token: req.params.token, error: null });
};

export const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ resetToken: req.params.token, resetTokenExp: { $gt: Date.now() } });
    if (!user) return res.render('error', { message: 'Credential reset window has closed.', code: 400 });
    const { password } = req.body;
    if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.');
    user.passwordHash = password;
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();
    res.redirect('/auth/login');
  } catch (err) {
    res.render('auth/reset-password', { title: 'Update Credentials — ThinkNote', token: req.params.token, error: err.message });
  }
};

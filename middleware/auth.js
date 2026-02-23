import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Attach user to req if token present — does NOT block
export const optionalAuth = async (req, res, next) => {
  // Always initialize to null so EJS templates can safely check `if (currentUser)`
  res.locals.currentUser = null;
  const token = req.cookies?.token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (user && !user.isSuspended) {
      req.user = user;
      res.locals.currentUser = user;
    }
  } catch {
    // invalid/expired token — clear the bad cookie
    res.clearCookie('token');
  }
  next();
};

// Block if not logged in
export const requireAuth = (req, res, next) => {
  if (!res.locals.currentUser) {
    return res.redirect('/auth/login');
  }
  next();
};

// Block if not admin
export const requireAdmin = (req, res, next) => {
  if (!res.locals.currentUser || res.locals.currentUser.role !== 'admin') {
    return res.status(403).render('error', { message: 'Forbidden', code: 403 });
  }
  next();
};

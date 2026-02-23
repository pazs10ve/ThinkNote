import { createRequire } from 'module';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// CJS interop — these packages use module.exports.Strategy
const require = createRequire(import.meta.url);
const { Strategy: GoogleStrategy }   = require('passport-google-oauth20');
const { Strategy: GitHubStrategy }   = require('passport-github2');

// Helper — issue JWT cookie after OAuth success
export function oauthCallback(req, res, user) {
  const token = jwt.sign(
    { userId: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.redirect('/');
}

// Required by Passport even with session:false — prevents "Failed to serialize" errors
passport.serializeUser((user, done) => done(null, user._id.toString()));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user);
  } catch (e) { done(e); }
});

// Helper — find or create user from OAuth profile
async function findOrCreate({ providerId, providerField, email, displayName }) {
  // 1. Find by provider ID
  let user = await User.findOne({ [providerField]: providerId });
  if (user) return user;

  // 2. Link to existing account by email
  if (email) {
    user = await User.findOne({ email });
    if (user) {
      user[providerField] = providerId;
      await user.save();
      return user;
    }
  }

  // 3. Create brand new user (no password)
  const base = (displayName || email || 'user')
    .toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 25) || 'user';
  let username = base;
  let n = 0;
  while (await User.findOne({ username })) username = `${base}${++n}`;

  user = new User({
    [providerField]: providerId,
    email: email || `${username}@oauth.placeholder`,
    displayName: displayName || username,
    username,
    isVerified: true,
  });
  await user.save();
  return user;
}

// ── Register Google strategy ───────────────────────
if (process.env.GOOGLE_CLIENT_ID) {
  passport.use('google', new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${process.env.BASE_URL || 'http://localhost:3000'}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreate({
          providerId:    profile.id,
          providerField: 'googleId',
          email:         profile.emails?.[0]?.value,
          displayName:   profile.displayName,
        });
        done(null, user);
      } catch (e) { done(e); }
    }
  ));
  console.log(' Google OAuth strategy registered');
} else {
  console.log('  GOOGLE_CLIENT_ID not set — Google OAuth disabled');
}

// ── Register GitHub strategy ────────────────────────
if (process.env.GITHUB_CLIENT_ID) {
  passport.use('github', new GitHubStrategy(
    {
      clientID:     process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:  `${process.env.BASE_URL || 'http://localhost:3000'}/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreate({
          providerId:    String(profile.id),
          providerField: 'githubId',
          email:         profile.emails?.[0]?.value,
          displayName:   profile.displayName || profile.username,
        });
        done(null, user);
      } catch (e) { done(e); }
    }
  ));
  console.log(' GitHub OAuth strategy registered');
} else {
  console.log(' GITHUB_CLIENT_ID not set — GitHub OAuth disabled');
}

export default passport;

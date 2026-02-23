import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import connectDB from './config/db.js';
import { optionalAuth } from './middleware/auth.js';
import passportInit from './config/passport.js';

import feedRouter from './routes/feed.js';
import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import usersRouter from './routes/users.js';
import searchRouter from './routes/search.js';
import apiRouter from './routes/api.js';
import adminRouter from './routes/admin.js';

// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Trust proxy for express-rate-limit in production (Railway/Render)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// CORS
app.use(cors({
  origin: process.env.BASE_URL || 'http://localhost:3000',
  credentials: true,
}));

// Security & logging
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(passportInit.initialize()); // Passport (session: false — JWT only)

// Static files
app.use(express.static(join(__dirname, 'public')));

// Attach user to all requests (reads JWT cookie)
app.use(optionalAuth);

// View helpers available in all EJS templates
app.use((req, res, next) => {
  res.locals.formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  res.locals.truncate = (str, n) => (str && str.length > n ? str.slice(0, n) + '…' : str || '');
  next();
});

// Routes
app.use('/', feedRouter);
app.use('/auth', authRouter);
app.use('/', postsRouter);
app.use('/', usersRouter);
app.use('/', searchRouter);
app.use('/api', apiRouter);
app.use('/admin', adminRouter);

// 404
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found.', code: 404 });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong on our end.', code: 500 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` ThinkNote running at http://localhost:${PORT}`));


# ThinkNote — System Architecture

## High-Level Architecture

```
Browser (HTML/CSS/JS)
        │  HTTP Requests
        ▼
  Express.js Server (Node.js)
        │
  ┌─────┴──────────────────────────────────┐
  │            Middleware Stack            │
  │  morgan · helmet · cors · rate-limit  │
  │  cookie-parser · express-session      │
  │  multer (file uploads)                │
  └─────┬──────────────────────────────────┘
        │
  ┌─────┴──────────────────────────────────┐
  │              Router Layer              │
  │  /auth  /posts  /users  /api  /admin  │
  └─────┬──────────────────────────────────┘
        │
  ┌─────┴──────────────────────────────────┐
  │           Controller Layer             │
  │  authController · postController      │
  │  userController · adminController     │
  │  commentController · notifController  │
  └─────┬──────────────────────────────────┘
        │
  ┌─────┴──────────────────────────────────┐
  │             Service Layer              │
  │  emailService · slugService           │
  │  uploadService · notifService         │
  └─────┬──────────────────────────────────┘
        │
  ┌─────┴──────────────────────────────────┐
  │           Mongoose Models              │
  │  User · Post · Comment                │
  │  Like · Bookmark · Notification       │
  └─────┬──────────────────────────────────┘
        │
   MongoDB Atlas (Cloud)
```

---

## Rendering Strategy: Server-Side Rendering (SSR)
- **EJS** templates rendered on the server, served as full HTML pages
- No frontend framework — plain JavaScript for interactivity (likes, tabs, markdown preview)
- JSON API endpoints (`/api/*`) for AJAX calls (like toggle, bookmark toggle, load comments)

---

## Project Folder Structure

```
thinknote/
├── config/
│   ├── db.js               # MongoDB connection
│   └── mailer.js           # Nodemailer transporter setup
│
├── controllers/
│   ├── authController.js
│   ├── postController.js
│   ├── userController.js
│   ├── commentController.js
│   ├── notificationController.js
│   └── adminController.js
│
├── middleware/
│   ├── auth.js             # requireAuth, requireAdmin, optionalAuth
│   ├── rateLimiter.js
│   └── uploadMiddleware.js # multer config
│
├── models/
│   ├── User.js
│   ├── Post.js
│   ├── Comment.js
│   ├── Like.js
│   ├── Bookmark.js
│   └── Notification.js
│
├── routes/
│   ├── auth.js
│   ├── posts.js
│   ├── users.js
│   ├── feed.js
│   ├── search.js
│   ├── api.js              # AJAX API endpoints
│   └── admin.js
│
├── services/
│   ├── emailService.js     # send* functions using nodemailer
│   ├── slugService.js      # generateSlug(title)
│   └── notifService.js     # createNotification + fire email
│
├── views/
│   ├── layouts/
│   │   ├── main.ejs        # base layout with nav
│   │   └── admin.ejs       # admin layout
│   ├── partials/
│   │   ├── nav.ejs
│   │   ├── post-card.ejs
│   │   ├── comment.ejs
│   │   └── pagination.ejs
│   ├── auth/
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   ├── forgot-password.ejs
│   │   └── reset-password.ejs
│   ├── posts/
│   │   ├── create.ejs
│   │   ├── edit.ejs
│   │   └── detail.ejs
│   ├── users/
│   │   ├── profile.ejs
│   │   ├── followers.ejs
│   │   └── following.ejs
│   ├── feed/
│   │   └── index.ejs
│   ├── explore.ejs
│   ├── search.ejs
│   ├── bookmarks.ejs
│   ├── settings.ejs
│   └── admin/
│       ├── dashboard.ejs
│       ├── users.ejs
│       └── posts.ejs
│
├── public/
│   ├── css/
│   │   ├── main.css
│   │   ├── nav.css
│   │   ├── post.css
│   │   ├── auth.css
│   │   └── admin.css
│   ├── js/
│   │   ├── main.js         # global UI (mobile nav, etc.)
│   │   ├── editor.js       # markdown editor + live preview
│   │   ├── like.js         # like toggle AJAX
│   │   └── comments.js     # comment submission AJAX
│   ├── img/
│   │   └── default-avatar.png
│   └── uploads/            # user-uploaded images (local dev)
│
├── emails/
│   ├── welcome.html
│   ├── verify.html
│   ├── reset-password.html
│   ├── new-follower.html
│   ├── post-liked.html
│   └── new-comment.html
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── server.js               # app entry point
```

---

## Authentication Flow

```
Register → hash password → save User (isVerified: false)
         → send verify email with token
         → user clicks link → isVerified: true

Login    → find user by email → compare password
         → create JWT (payload: userId, role, username)
         → set httpOnly cookie `token`
         → redirect to feed

Request  → cookie-parser reads `token` cookie
         → auth middleware verifies JWT
         → attaches `req.user` to request
         → controller proceeds or 401
```

---

## Notification Pipeline

```
Event happens (e.g., user A likes user B's post)
  → notifService.createNotification({ recipient: B, type: 'post_liked', ... })
    → saves Notification doc to DB
    → checks B.notifyOnLike === true
    → if true: emailService.sendPostLikedEmail(B.email, post, A)
```

---

## API vs Page Routes

| Type | Prefix | Response |
|---|---|---|
| Page route | `/`, `/post/:slug`, `/u/:username` etc. | EJS rendered HTML |
| AJAX API | `/api/posts/:id/like` etc. | JSON `{ success, data }` |
| Admin page | `/admin/*` | EJS rendered HTML |

---

## Security Decisions

| Concern | Solution |
|---|---|
| Password storage | bcrypt, saltRounds 12 |
| Auth tokens | JWT in httpOnly cookie (not localStorage) |
| XSS | Markdown sanitized with DOMPurify client-side; EJS auto-escapes |
| CSRF | SameSite=Strict cookie attribute |
| Rate limiting | express-rate-limit on `/auth/*` and `/api/*` |
| Headers | helmet.js (Content-Security-Policy, X-Frame-Options, etc.) |
| File uploads | mime-type check + size limit (2MB), stored in `/public/uploads` |

---

## Environment Variables (.env)

```
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
COOKIE_SECRET=another_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
EMAIL_FROM="ThinkNote <noreply@thinknote.app>"

BASE_URL=http://localhost:3000
NODE_ENV=development
```

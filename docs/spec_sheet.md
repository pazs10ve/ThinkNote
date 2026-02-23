# ThinkNote — Product Specification Sheet

## Vision
ThinkNote is a clean, focused blog publishing platform for writers, developers, and thinkers. It combines the simplicity of a personal notebook with the social dynamics of a community feed — follow people, discover ideas, engage through comments, and build a writing identity.

---

## Target Users
| Persona | Description |
|---|---|
| **Writers** | People who blog regularly and want a clean, distraction-free space |
| **Developers** | Technical folks who want to publish tutorials and notes |
| **Readers** | People who follow specific writers and discover content |
| **Admins** | Platform moderators managing content and users |

---

## Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Templating | EJS (server-side rendered) |
| Styling | Vanilla CSS |
| Auth | JWT (in cookies) |
| Email | Nodemailer |
| File Upload | Multer + local storage (or Cloudinary later) |
| Markdown | `marked.js` + `DOMPurify` (client-side) |

---

## Core Feature Modules

### 1. Authentication
- Register with email + password
- Login / Logout
- Email verification (token via email)
- Forgot password / Reset password via email
- Remember me (persistent cookie)
- Auth middleware protecting private routes

### 2. User Profiles
- Display name, username, bio, avatar, social links
- Profile page: all published posts by the user
- Edit profile (name, bio, avatar, links)
- Follow / Unfollow users
- Followers list & Following list pages

### 3. Blog Posts
- Create post: title, content (markdown), tags, cover image
- In-browser Markdown editor with live preview
- Post slug auto-generated from title
- Draft / Published state
- Edit & Delete own posts
- Individual post detail page with rendered markdown

### 4. Home Feed
- **Global Feed** — latest published posts, all users
- **Following Feed** — posts only from followed users
- Tag filter on feed
- Pagination (page-based)

### 5. Interactions
- Like / Unlike a post (toggle)
- Bookmark / Save a post
- Comment on a post (flat list)
- Reply to comments (1 level deep)
- Post share (copy link)
- Like count, comment count visible on post cards

### 6. Search & Discovery
- Full-text search on post title + body
- Search users by name / username
- Explore page: all tags, trending posts (by likes in last 7 days)

### 7. Email Notifications
- Welcome email on signup
- Email verification link
- Password reset link
- Notification: new follower
- Notification: post liked
- Notification: new comment on your post
- Notification: reply to your comment

### 8. Admin Dashboard
- Separate login route (`/admin/login`)
- View all users: suspend, ban, delete
- View all posts: delete any post
- View site stats: total users, posts, comments, likes
- Role: `user` | `admin`

---

## Pages & Routes Overview

### Public Pages
| Page | Route |
|---|---|
| Landing / Home Feed | `GET /` |
| Post Detail | `GET /post/:slug` |
| User Profile | `GET /u/:username` |
| Explore / Tags | `GET /explore` |
| Search Results | `GET /search?q=...` |
| Login | `GET /login` |
| Register | `GET /register` |
| Forgot Password | `GET /forgot-password` |
| Reset Password | `GET /reset-password/:token` |

### Authenticated User Pages
| Page | Route |
|---|---|
| Following Feed | `GET /feed` |
| Create Post | `GET /new-post` |
| Edit Post | `GET /posts/:id/edit` |
| My Bookmarks | `GET /bookmarks` |
| Settings / Edit Profile | `GET /settings` |
| Followers List | `GET /u/:username/followers` |
| Following List | `GET /u/:username/following` |

### Admin Pages
| Page | Route |
|---|---|
| Admin Dashboard | `GET /admin` |
| Admin Users | `GET /admin/users` |
| Admin Posts | `GET /admin/posts` |

---

## User Stories (Key)

**As a visitor**, I can read any published post without logging in.
**As a visitor**, I can sign up and verify my email to become a member.
**As a member**, I can write and publish blog posts with markdown.
**As a member**, I can follow other writers and see their posts in my feed.
**As a member**, I can like, comment, and bookmark posts.
**As a member**, I can edit my profile, avatar, and bio.
**As a member**, I receive email notifications for key events.
**As an admin**, I can view the platform and moderate users and posts.

---

## Non-Functional Requirements
- **Performance**: Pages should load in < 2s under normal load
- **Security**: Passwords hashed with bcrypt (saltRounds 12), XSS-safe markdown rendering, CSRF protection, rate limiting on login
- **SEO**: Server-rendered HTML, title + meta description per page, Open Graph tags for posts
- **Accessibility**: Semantic HTML, readable font sizes, keyboard-navigable nav
- **Mobile-ready**: Responsive at 375px, 768px, 1280px breakpoints
- **Scalability**: DB queries indexed on common fields (slug, username, tags, createdAt)

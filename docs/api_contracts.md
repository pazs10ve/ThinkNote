# ThinkNote — API Contracts

> These are the **AJAX/JSON API** endpoints (prefix `/api`).  
> Page routes (returning HTML) are documented in the spec sheet.  
> All responses follow: `{ success: true|false, data: {}, message: "" }`

---

## Auth (`/auth` — page routes, form POST)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/auth/register` | Public | Show register page |
| POST | `/auth/register` | Public | Create account, send verify email |
| GET | `/auth/login` | Public | Show login page |
| POST | `/auth/login` | Public | Validate creds, set JWT cookie |
| GET | `/auth/logout` | User | Clear JWT cookie |
| GET | `/auth/verify/:token` | Public | Verify email address |
| GET | `/auth/forgot-password` | Public | Show forgot password page |
| POST | `/auth/forgot-password` | Public | Send reset link email |
| GET | `/auth/reset-password/:token` | Public | Show reset form |
| POST | `/auth/reset-password/:token` | Public | Update password |

---

## Posts (AJAX API)

### Like a post
```
POST /api/posts/:id/like
Auth: Required
Body: none
Response: { success: true, liked: true|false, likeCount: 42 }
```

### Bookmark a post
```
POST /api/posts/:id/bookmark
Auth: Required
Body: none
Response: { success: true, bookmarked: true|false }
```

### Increment view count
```
POST /api/posts/:id/view
Auth: Optional (fires on page load)
Body: none
Response: { success: true }
```

---

## Posts (Page Routes)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Home / global feed |
| GET | `/feed` | User | Following feed |
| GET | `/post/:slug` | Public | Post detail |
| GET | `/new-post` | User | Create post page |
| POST | `/posts` | User | Submit new post |
| GET | `/posts/:id/edit` | User (owner) | Edit post page |
| POST | `/posts/:id` + `?_method=PUT` | User (owner) | Save edits |
| POST | `/posts/:id/delete` | User (owner/admin) | Delete post |

**POST `/posts` body:**
```
title, body (markdown), tags (comma-sep), status (draft|published), coverImage (file)
```

---

## Comments (AJAX API)

### Get comments for a post
```
GET /api/posts/:postId/comments
Auth: Optional
Query: ?page=1&limit=20
Response: {
  success: true,
  data: [
    {
      _id, body, createdAt,
      author: { username, displayName, avatarUrl },
      replies: [ ...same shape ]
    }
  ],
  total, page, pages
}
```

### Add a comment
```
POST /api/posts/:postId/comments
Auth: Required
Body: { body: "Great post!", parentId: null | "<commentId>" }
Response: {
  success: true,
  data: { _id, body, createdAt, author: { username, displayName, avatarUrl } }
}
```

### Delete a comment
```
DELETE /api/comments/:commentId
Auth: Required (owner or admin)
Response: { success: true }
```

---

## Users (AJAX API)

### Follow / Unfollow
```
POST /api/users/:username/follow
Auth: Required
Body: none
Response: { success: true, following: true|false, followerCount: 12 }
```

---

## Users (Page Routes)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/u/:username` | Public | User profile page |
| GET | `/u/:username/followers` | Public | Followers list |
| GET | `/u/:username/following` | Public | Following list |
| GET | `/settings` | User | Edit profile page |
| POST | `/settings` | User | Save profile changes |
| POST | `/settings/avatar` | User | Upload new avatar |

**POST `/settings` body:**
```
displayName, bio, website, twitter, github,
notifyOnFollow, notifyOnLike, notifyOnComment
```

---

## Notifications (AJAX API)

### Get notifications
```
GET /api/notifications
Auth: Required
Query: ?page=1&limit=20
Response: {
  success: true,
  data: [
    {
      _id, type, isRead, createdAt,
      sender: { username, displayName, avatarUrl },
      post: { slug, title }
    }
  ],
  unreadCount
}
```

### Mark all as read
```
POST /api/notifications/read-all
Auth: Required
Response: { success: true }
```

### Mark one as read
```
POST /api/notifications/:id/read
Auth: Required
Response: { success: true }
```

---

## Search (Page Route)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/search?q=...&type=posts\|users` | Public | Search results page |
| GET | `/explore` | Public | Explore tags + trending posts |
| GET | `/bookmarks` | User | Saved posts page |

---

## Admin (Page Routes)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin` | Admin | Dashboard overview |
| GET | `/admin/users` | Admin | All users list |
| POST | `/admin/users/:id/suspend` | Admin | Toggle suspend |
| POST | `/admin/users/:id/delete` | Admin | Delete user |
| GET | `/admin/posts` | Admin | All posts list |
| POST | `/admin/posts/:id/delete` | Admin | Delete any post |

---

## Error Responses

| Status | Meaning |
|---|---|
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Forbidden (not owner / not admin) |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Server error |

```json
{
  "success": false,
  "message": "You must be logged in to do that."
}
```

---

## Conventions
- Method overriding: HTML forms use `POST` with `?_method=PUT` / `?_method=DELETE` via `method-override` package
- Pagination: always `?page=N`, default `limit=10` for feeds, `20` for comments
- Auth: JWT stored in `httpOnly` cookie named `token`, verified by `requireAuth` middleware
- All `/api/*` routes return JSON; page routes return HTML or redirect

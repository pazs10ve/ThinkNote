# ThinkNote — Database Schemas (MongoDB / Mongoose)

## Collections Overview
| Collection | Purpose |
|---|---|
| `users` | Account & profile data |
| `posts` | Blog posts |
| `comments` | Post comments & replies |
| `likes` | Post likes (many-to-many join) |
| `bookmarks` | Saved posts per user |
| `notifications` | In-app + email notification queue |

---

## 1. `users`

```js
{
  _id: ObjectId,
  username:       { type: String, unique: true, required, lowercase, trim, 3-30 chars },
  email:          { type: String, unique: true, required, lowercase },
  passwordHash:   { type: String, required },             // bcrypt hash
  displayName:    { type: String, required, trim },
  bio:            { type: String, default: '', max: 300 },
  avatarUrl:      { type: String, default: '/img/default-avatar.png' },
  website:        { type: String, default: '' },
  twitter:        { type: String, default: '' },
  github:         { type: String, default: '' },

  // Auth
  role:           { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified:     { type: Boolean, default: false },
  verifyToken:    { type: String },                       // email verification
  verifyTokenExp: { type: Date },
  resetToken:     { type: String },                       // password reset
  resetTokenExp:  { type: Date },
  isSuspended:    { type: Boolean, default: false },

  // Social graph (arrays of ObjectIds)
  followers:      [{ type: ObjectId, ref: 'User' }],
  following:      [{ type: ObjectId, ref: 'User' }],

  // Email notification preferences
  notifyOnFollow:   { type: Boolean, default: true },
  notifyOnLike:     { type: Boolean, default: true },
  notifyOnComment:  { type: Boolean, default: true },

  createdAt:      Date,
  updatedAt:      Date
}
```

**Indexes**: `username` (unique), `email` (unique), `createdAt`

---

## 2. `posts`

```js
{
  _id: ObjectId,
  author:       { type: ObjectId, ref: 'User', required },
  title:        { type: String, required, trim, max: 150 },
  slug:         { type: String, unique: true, required },  // auto-gen from title + nanoid suffix
  body:         { type: String, required },                // raw Markdown
  excerpt:      { type: String, max: 300 },               // auto-gen from body (first 300 chars)
  coverImage:   { type: String, default: '' },             // URL
  tags:         [{ type: String, lowercase, trim }],       // max 5 tags
  status:       { type: String, enum: ['draft', 'published'], default: 'draft' },

  // Computed / denormalized counters (updated on like/comment events)
  likeCount:    { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  viewCount:    { type: Number, default: 0 },

  publishedAt:  { type: Date },                           // set when status -> published
  createdAt:    Date,
  updatedAt:    Date
}
```

**Indexes**: `slug` (unique), `author`, `tags`, `status + publishedAt` (compound), `title` (text index for search), `body` (text index for search)

> **Text Index**: `db.posts.createIndex({ title: 'text', body: 'text' })` — enables `$text` search.

---

## 3. `comments`

```js
{
  _id: ObjectId,
  post:       { type: ObjectId, ref: 'Post', required },
  author:     { type: ObjectId, ref: 'User', required },
  body:       { type: String, required, trim, max: 2000 },
  parentId:   { type: ObjectId, ref: 'Comment', default: null }, // null = top-level, set = reply
  isDeleted:  { type: Boolean, default: false },                 // soft-delete

  createdAt:  Date,
  updatedAt:  Date
}
```

**Indexes**: `post`, `author`, `parentId`, `createdAt`

---

## 4. `likes`

```js
{
  _id: ObjectId,
  user:       { type: ObjectId, ref: 'User', required },
  post:       { type: ObjectId, ref: 'Post', required },
  createdAt:  Date
}
```

**Indexes**: `{ user, post }` (unique compound) — prevents duplicate likes

---

## 5. `bookmarks`

```js
{
  _id: ObjectId,
  user:       { type: ObjectId, ref: 'User', required },
  post:       { type: ObjectId, ref: 'Post', required },
  createdAt:  Date
}
```

**Indexes**: `{ user, post }` (unique compound), `user + createdAt`

---

## 6. `notifications`

```js
{
  _id: ObjectId,
  recipient:  { type: ObjectId, ref: 'User', required },
  sender:     { type: ObjectId, ref: 'User' },            // who triggered it
  type:       { type: String, enum: [
    'new_follower', 'post_liked', 'new_comment', 'comment_reply'
  ]},
  post:       { type: ObjectId, ref: 'Post' },            // relevant post (if any)
  comment:    { type: ObjectId, ref: 'Comment' },         // relevant comment (if any)
  isRead:     { type: Boolean, default: false },
  emailSent:  { type: Boolean, default: false },          // track if email fired
  createdAt:  Date
}
```

**Indexes**: `recipient + isRead`, `createdAt`

---

## Relationships Summary

```
User ──< Post          (author → posts)
User ──< User          (followers / following — self-join on User)
Post ──< Comment       (post → comments)
Comment ──< Comment    (parentId → replies, 1 level)
User ──< Like >── Post (many-to-many via likes collection)
User ──< Bookmark >── Post (many-to-many via bookmarks collection)
User ──< Notification  (recipient → notifications)
```

---

## Naming Conventions
- All collection names: **plural, lowercase** (users, posts, comments…)
- All ObjectId refs named after the model they point to: `author`, `post`, `comment`, `recipient`, `sender`
- Timestamps: always include `timestamps: true` in Mongoose schema options
- Slugs: lowercase, hyphenated, unique (collisions handled with nanoid suffix)

import Post from '../models/Post.js';

const PAGE_SIZE = 10;

export const globalFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const tag = req.query.tag || null;
    const filter = { status: 'published', ...(tag ? { tags: tag } : {}) };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .populate('author', 'username displayName avatarUrl'),
      Post.countDocuments(filter),
    ]);

    res.render('feed/index', {
      title: 'ThinkNote — Home', posts, page,
      pages: Math.ceil(total / PAGE_SIZE), activeTag: tag, feedType: 'global',
    });
  } catch (err) {
    res.render('error', { message: 'Could not load feed.', code: 500 });
  }
};

export const followingFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const followingIds = res.locals.currentUser.following;

    const [posts, total] = await Promise.all([
      Post.find({ status: 'published', author: { $in: followingIds } })
        .sort({ publishedAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .populate('author', 'username displayName avatarUrl'),
      Post.countDocuments({ status: 'published', author: { $in: followingIds } }),
    ]);

    res.render('feed/index', {
      title: 'Following — ThinkNote', posts, page,
      pages: Math.ceil(total / PAGE_SIZE), activeTag: null, feedType: 'following',
    });
  } catch (err) {
    res.render('error', { message: 'Could not load feed.', code: 500 });
  }
};

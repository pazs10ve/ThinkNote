import Post from '../models/Post.js';
import User from '../models/User.js';

export const search = async (req, res) => {
  const q = req.query.q?.trim() || '';
  const type = req.query.type || 'posts';
  let results = [];
  if (q) {
    if (type === 'posts') {
      results = await Post.find({ $text: { $search: q }, status: 'published' })
        .sort({ score: { $meta: 'textScore' } })
        .limit(20)
        .populate('author', 'username displayName avatarUrl');
    } else {
      results = await User.find({
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { displayName: { $regex: q, $options: 'i' } },
        ],
      }).select('username displayName avatarUrl bio').limit(20);
    }
  }
  res.render('search', { title: `Search: ${q} — ThinkNote`, q, type, results });
};

export const explore = async (req, res) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const trending = await Post.find({ status: 'published', publishedAt: { $gte: since } })
    .sort({ likeCount: -1 })
    .limit(10)
    .populate('author', 'username displayName avatarUrl');

  const tagsAgg = await Post.aggregate([
    { $match: { status: 'published' } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 50 },
  ]);

  res.render('explore', { title: 'Explore — ThinkNote', trending, tags: tagsAgg });
};

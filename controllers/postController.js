import Post from '../models/Post.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import { generateSlug } from '../services/slugService.js';
import { marked } from 'marked';

export const showCreate = (req, res) => {
  res.render('posts/create', { title: 'Draft Blueprint — ThinkNote', error: null, values: {} });
};

export const create = async (req, res) => {
  try {
    const { title, body, tags, status } = req.body;
    if (!title || !body) throw new Error('Title and body are required.');
    const slug = generateSlug(title);
    const coverImage = req.file ? `/uploads/covers/${req.file.filename}` : '';
    const tagArray = tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 5) : [];

    const post = await Post.create({
      author: res.locals.currentUser._id,
      title, body, slug, coverImage,
      tags: tagArray,
      status: status === 'published' ? 'published' : 'draft',
    });
    res.redirect(`/post/${post.slug}`);
  } catch (err) {
    res.render('posts/create', { title: 'Draft Blueprint — ThinkNote', error: err.message, values: req.body });
  }
};

export const detail = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'username displayName avatarUrl bio followers');

    if (!post) return res.render('error', { message: 'Blueprint not found in the workshop index.', code: 404 });

    const htmlBody = marked.parse(post.body);
    let userLiked = false, userBookmarked = false, userFollowsAuthor = false;

    if (res.locals.currentUser) {
      const uid = res.locals.currentUser._id;
      [userLiked, userBookmarked] = await Promise.all([
        Like.exists({ user: uid, post: post._id }),
        Bookmark.exists({ user: uid, post: post._id }),
      ]);
      userFollowsAuthor = post.author.followers.some(f => f.toString() === uid.toString());
    }

    Post.updateOne({ _id: post._id }, { $inc: { viewCount: 1 } }).exec();

    res.render('posts/detail', {
      title: `${post.title} — ThinkNote`,
      post, htmlBody,
      userLiked: !!userLiked,
      userBookmarked: !!userBookmarked,
      userFollowsAuthor,
    });
  } catch (err) {
    res.render('error', { message: 'Could not load your blueprint.', code: 500 });
  }
};

export const showEdit = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.render('error', { message: 'Blueprint not found in the workshop index.', code: 404 });
    if (post.author.toString() !== res.locals.currentUser._id.toString())
      return res.render('error', { message: 'Access denied: You are not the commissioned architect.', code: 403 });
    res.render('posts/edit', { title: 'Refine Blueprint — ThinkNote', post, error: null });
  } catch (err) {
    res.render('error', { message: 'Could not load your blueprint.', code: 500 });
  }
};

export const update = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.render('error', { message: 'Blueprint not found in the workshop index.', code: 404 });
    if (post.author.toString() !== res.locals.currentUser._id.toString())
      return res.render('error', { message: 'Access denied: You are not the commissioned architect.', code: 403 });

    const { title, body, tags, status } = req.body;
    post.title = title || post.title;
    post.body = body || post.body;
    post.tags = tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 5) : post.tags;
    post.status = status === 'published' ? 'published' : 'draft';
    if (req.file) post.coverImage = `/uploads/covers/${req.file.filename}`;
    await post.save();
    res.redirect(`/post/${post.slug}`);
  } catch (err) {
    res.render('error', { message: 'Could not update post.', code: 500 });
  }
};

export const delete_ = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.render('error', { message: 'Blueprint not found in the workshop index.', code: 404 });
    const isOwner = post.author.toString() === res.locals.currentUser._id.toString();
    const isAdmin = res.locals.currentUser.role === 'admin';
    if (!isOwner && !isAdmin) return res.render('error', { message: 'Access denied: You are not the commissioned architect.', code: 403 });
    await post.deleteOne();
    res.redirect('/');
  } catch (err) {
    res.render('error', { message: 'Could not delete post.', code: 500 });
  }
};
// 'delete' is a reserved word — export by alias
export { delete_ as delete };

export const bookmarks = async (req, res) => {
  try {
    const items = await Bookmark.find({ user: res.locals.currentUser._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'post', populate: { path: 'author', select: 'username displayName avatarUrl' } });
    const posts = items.map(b => b.post).filter(Boolean);
    res.render('bookmarks', { title: 'Archived Blueprints — ThinkNote', posts });
  } catch (err) {
    res.render('error', { message: 'Could not load bookmarks.', code: 500 });
  }
};

import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import mailService from '../services/mailService.js';

const json = (res, data, status = 200) => res.status(status).json(data);

export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return json(res, { success: false, message: 'Post not found.' }, 404);
    const existing = await Like.findOne({ user: res.locals.currentUser._id, post: post._id });
    let liked;
    if (existing) {
      await existing.deleteOne();
      await Post.updateOne({ _id: post._id }, { $inc: { likeCount: -1 } });
      liked = false;
    } else {
      await Like.create({ user: res.locals.currentUser._id, post: post._id });
      await Post.updateOne({ _id: post._id }, { $inc: { likeCount: 1 } });
      liked = true;
    }
    const updated = await Post.findById(post._id).select('likeCount').populate('author');
    
    // Email Notification for Like
    if (liked && updated.author.notifyOnLike && updated.author._id.toString() !== res.locals.currentUser._id.toString()) {
      mailService.sendLikeNotification(
        updated.author.email,
        res.locals.currentUser.displayName,
        post.title,
        post.slug
      ).catch(err => console.error('Like email failed:', err));
    }

    json(res, { success: true, liked, likeCount: updated.likeCount });
  } catch (err) {
    json(res, { success: false, message: err.message }, 500);
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const existing = await Bookmark.findOne({ user: res.locals.currentUser._id, post: req.params.id });
    if (existing) {
      await existing.deleteOne();
      return json(res, { success: true, bookmarked: false });
    }
    await Bookmark.create({ user: res.locals.currentUser._id, post: req.params.id });
    json(res, { success: true, bookmarked: true });
  } catch (err) {
    json(res, { success: false, message: err.message }, 500);
  }
};

export const incrementView = async (req, res) => {
  try {
    await Post.updateOne({ _id: req.params.id }, { $inc: { viewCount: 1 } });
    json(res, { success: true });
  } catch {
    json(res, { success: true });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username });
    if (!target) return json(res, { success: false, message: 'User not found.' }, 404);
    const me = await User.findById(res.locals.currentUser._id);
    if (target._id.toString() === me._id.toString())
      return json(res, { success: false, message: "You can't follow yourself." }, 400);
    const isFollowing = me.following.some(id => id.toString() === target._id.toString());
    if (isFollowing) {
      me.following.pull(target._id);
      target.followers.pull(me._id);
    } else {
      me.following.push(target._id);
      target.followers.push(me._id);
    }
    await Promise.all([me.save(), target.save()]);

    // Email Notification for Follow
    if (!isFollowing && target.notifyOnFollow) {
      mailService.sendFollowNotification(
        target.email,
        me.displayName,
        me.username
      ).catch(err => console.error('Follow email failed:', err));
    }

    json(res, { success: true, following: !isFollowing, followerCount: target.followers.length });
  } catch (err) {
    json(res, { success: false, message: err.message }, 500);
  }
};

export const getComments = async (req, res) => {
  try {
    const topLevel = await Comment.find({ post: req.params.postId, parentId: null, isDeleted: false })
      .sort({ createdAt: 1 })
      .populate('author', 'username displayName avatarUrl');
    const withReplies = await Promise.all(topLevel.map(async (c) => {
      const replies = await Comment.find({ parentId: c._id, isDeleted: false })
        .sort({ createdAt: 1 })
        .populate('author', 'username displayName avatarUrl');
      return { ...c.toObject(), replies };
    }));
    json(res, { success: true, data: withReplies });
  } catch (err) {
    json(res, { success: false, message: err.message }, 500);
  }
};

export const addComment = async (req, res) => {
  try {
    const { body, parentId } = req.body;
    if (!body?.trim()) return json(res, { success: false, message: 'Comment cannot be empty.' }, 400);
    const comment = await Comment.create({
      post: req.params.postId,
      author: res.locals.currentUser._id,
      body: body.trim(),
      parentId: parentId || null,
    });
    await Post.updateOne({ _id: req.params.postId }, { $inc: { commentCount: 1 } });
    await comment.populate('author', 'username displayName avatarUrl');

    // Email Notification for Comment
    const post = await Post.findById(req.params.postId).populate('author');
    if (post.author.notifyOnComment && post.author._id.toString() !== res.locals.currentUser._id.toString()) {
      mailService.sendCommentNotification(
        post.author.email,
        res.locals.currentUser.displayName,
        post.title,
        post.slug,
        body.substring(0, 100) + (body.length > 100 ? '...' : '')
      ).catch(err => console.error('Comment email failed:', err));
    }

    json(res, { success: true, data: comment });
  } catch (err) {
    json(res, { success: false, message: err.message }, 500);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return json(res, { success: false, message: 'Comment not found.' }, 404);
    const isOwner = comment.author.toString() === res.locals.currentUser._id.toString();
    const isAdmin = res.locals.currentUser.role === 'admin';
    if (!isOwner && !isAdmin) return json(res, { success: false, message: 'Forbidden.' }, 403);
    comment.isDeleted = true;
    comment.body = '[deleted]';
    await comment.save();
    await Post.updateOne({ _id: comment.post }, { $inc: { commentCount: -1 } });
    json(res, { success: true });
  } catch (err) {
    json(res, { success: false, message: err.message }, 500);
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: res.locals.currentUser._id })
      .sort({ createdAt: -1 }).limit(30)
      .populate('sender', 'username displayName avatarUrl')
      .populate('post', 'slug title');
    const unreadCount = await Notification.countDocuments({ recipient: res.locals.currentUser._id, isRead: false });
    json(res, { success: true, data: notifications, unreadCount });
  } catch (err) {
    json(res, { success: false, message: err.message }, 500);
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: res.locals.currentUser._id, isRead: false }, { isRead: true });
    json(res, { success: true });
  } catch (err) {
    json(res, { success: false, message: err.message }, 500);
  }
};

export const markOneRead = async (req, res) => {
  try {
    await Notification.updateOne({ _id: req.params.id, recipient: res.locals.currentUser._id }, { isRead: true });
    json(res, { success: true });
  } catch (err) {
    json(res, { success: false, message: err.message }, 500);
  }
};

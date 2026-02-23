import User from '../models/User.js';
import Post from '../models/Post.js';

export const profile = async (req, res) => {
  try {
    const profileUser = await User.findOne({ username: req.params.username }).select('-passwordHash');
    if (!profileUser) return res.render('error', { message: 'User not found.', code: 404 });

    const posts = await Post.find({ author: profileUser._id, status: 'published' })
      .sort({ publishedAt: -1 }).limit(20);

    let isFollowing = false;
    if (res.locals.currentUser) {
      isFollowing = profileUser.followers.some(
        id => id.toString() === res.locals.currentUser._id.toString()
      );
    }

    res.render('users/profile', {
      title: `@${profileUser.username}`,
      profileUser, posts, isFollowing,
    });
  } catch (err) {
    res.render('error', { message: 'Could not load profile.', code: 500 });
  }
};

export const followers = async (req, res) => {
  try {
    const profileUser = await User.findOne({ username: req.params.username })
      .populate('followers', 'username displayName avatarUrl bio');
    if (!profileUser) return res.render('error', { message: 'User not found.', code: 404 });
    res.render('users/followers', {
      title: 'Followers',
      profileUser, users: profileUser.followers,
    });
  } catch (err) {
    res.render('error', { message: 'Could not load followers.', code: 500 });
  }
};

export const following = async (req, res) => {
  try {
    const profileUser = await User.findOne({ username: req.params.username })
      .populate('following', 'username displayName avatarUrl bio');
    if (!profileUser) return res.render('error', { message: 'User not found.', code: 404 });
    res.render('users/following', {
      title: 'Following',
      profileUser, users: profileUser.following,
    });
  } catch (err) {
    res.render('error', { message: 'Could not load following list.', code: 500 });
  }
};

export const showSettings = (req, res) => {
  res.render('settings', { title: 'Settings', error: null, success: null });
};

export const updateSettings = async (req, res) => {
  try {
    const { displayName, bio, website, twitter, github, notifyOnFollow, notifyOnLike, notifyOnComment } = req.body;
    const user = await User.findById(res.locals.currentUser._id);
    user.displayName = displayName || user.displayName;
    user.bio = bio !== undefined ? bio : user.bio;
    user.website = website || '';
    user.twitter = twitter || '';
    user.github = github || '';
    user.notifyOnFollow = !!notifyOnFollow;
    user.notifyOnLike = !!notifyOnLike;
    user.notifyOnComment = !!notifyOnComment;
    await user.save();
    res.render('settings', { title: 'Settings', error: null, success: 'Profile updated!' });
  } catch (err) {
    res.render('settings', { title: 'Settings', error: err.message, success: null });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) throw new Error('No file uploaded.');
    const user = await User.findById(res.locals.currentUser._id);
    user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.save();
    res.redirect('/settings');
  } catch (err) {
    res.render('settings', { title: 'Settings', error: err.message, success: null });
  }
};

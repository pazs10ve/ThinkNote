import User from '../models/User.js';
import Post from '../models/Post.js';

export const dashboard = async (req, res) => {
  const [userCount, postCount] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments({ status: 'published' }),
  ]);
  res.render('admin/dashboard', { title: 'Admin Dashboard — ThinkNote', userCount, postCount });
};

export const users = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select('-passwordHash');
  res.render('admin/users', { title: 'Manage Users — ThinkNote', users });
};

export const toggleSuspend = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) { user.isSuspended = !user.isSuspended; await user.save(); }
  res.redirect('/admin/users');
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/users');
};

export const posts = async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'username displayName');
  res.render('admin/posts', { title: 'Manage Posts — ThinkNote', posts });
};

export const deletePost = async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/admin/posts');
};

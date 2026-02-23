import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String, required: true, unique: true,
      lowercase: true, trim: true,
      minlength: 3, maxlength: 30,
      match: [/^[a-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true, maxlength: 60 },
    bio: { type: String, default: '', maxlength: 300 },
    avatarUrl: { type: String, default: '/img/default-avatar.png' },
    website: { type: String, default: '' },
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    verifyTokenExp: { type: Date },
    resetToken: { type: String },
    resetTokenExp: { type: Date },
    isSuspended: { type: Boolean, default: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notifyOnFollow: { type: Boolean, default: true },
    notifyOnLike: { type: Boolean, default: true },
    notifyOnComment: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.virtual('followerCount').get(function () { return this.followers.length; });
userSchema.virtual('followingCount').get(function () { return this.following.length; });

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['new_follower', 'post_liked', 'new_comment', 'comment_reply'],
      required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    isRead: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);

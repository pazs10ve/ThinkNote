import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parentId: 1 });

export default mongoose.model('Comment', commentSchema);

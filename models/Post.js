import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, unique: true, required: true, lowercase: true },
    body: { type: String, required: true },
    excerpt: { type: String, maxlength: 300 },
    coverImage: { type: String, default: '' },
    tags: [{ type: String, lowercase: true, trim: true }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    format: { type: String, enum: ['markdown', 'richtext', 'latex'], default: 'markdown' },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', body: 'text' });
postSchema.index({ author: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ status: 1, publishedAt: -1 });

postSchema.pre('save', function () {
  if (this.isModified('body')) {
    let plain = this.body;
    
    if (this.format === 'richtext') {
      // Strip HTML tags simply for the excerpt
      plain = plain.replace(/<[^>]+>/g, ' ');
    } else {
      // Strip Markdown/LaTeX formatting
      plain = plain
        .replace(/#{1,6}\s+/g, '') // Headers
        .replace(/[*_`~>]/g, '')    // Formatting chars
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
        .replace(/\$\$.*?\$\$/g, '') // Block Math
        .replace(/\$.*?\$/g, '');    // Inline Math
    }
    
    plain = plain.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    this.excerpt = plain.slice(0, 300);
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export default mongoose.model('Post', postSchema);

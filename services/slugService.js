import { nanoid } from 'nanoid';

/**
 * Generate a URL-safe slug from a post title.
 * Appends a short nanoid suffix for guaranteed uniqueness.
 * e.g. "Hello World!" => "hello-world-abc123"
 */
export const generateSlug = (title) => {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  return `${base}-${nanoid(6)}`;
};

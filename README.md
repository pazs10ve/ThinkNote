# ThinkNote: The Architect's Workshop 

**ThinkNote** is a premium, full-stack blogging platform designed for makers, engineers, and deep thinkers. It transforms the traditional blogging experience into an "Architect's Workshop": a space dedicated to drafting high-fidelity ideas and building a digital intellectual legacy.

---

##  The "Golden Hour" Vision
ThinkNote is not just a tool; it is an aesthetic experience. The platform is designed around the **Golden Hour Vision**: the precise moment when the afternoon sun casts a warm, orange-gold glow across an architect's drafting table.

*   **Philosophical Focus**: We believe that the best ideas are engineered, not just written. Every post is treated as a "Blueprint" a structured, valuable document that contributes to a larger body of work.
*   **Aesthetic Principles**: The UI uses a "Golden Hour" palette (warm ambers, soft sunsets, and deep workshop blues) to create a high-contrast yet calming environment that fosters focus and creativity.
*   **Narrative Immersion**: From the "Exhibition Hall" (feed) to the "Construction" (post editor), the entire application speaks the language of the workshop, elevating the act of publishing into an act of creation.

---

##  Comprehensive Functionality

###  Narrative-Driven Publishing
- **Blueprint Drafting (Markdown)**: A professional editor with a real-time, split-pane live preview powered by `marked.js`.
- **Media-Rich Content**: Support for header cover images, text-based excerpts, and architectural tagging (taxonomy).
- **Draft & Publish Flow**: Save your blueprints in progress or commission them to the public Exhibition Hall when ready.

###  The Builder Social Network
- **Architect Profiles**: Highly customizable profiles featuring bios, social links (Twitter, GitHub, Website), and curated work galleries.
- **Peer Recognition**: "Architectural Endorsements" (likes) and "Archived Blueprints" (bookmarks) allow users to interact with and save high-quality content.
- **Deep Conversations**: A robust comment system supporting nested replies, allowing for nuanced technical discussions between builders.
- **Following System**: Follow your favorite masters to see their latest blueprints in your personalized "Workshop Feed".
- **Real-Time Avatar Uploads**: Update your personal brand identity directly from your settings.

###  Discovery & Intelligence
- **Exhibition Search**: High-performance keyword scanning using MongoDB text indexing.
- **Global Exhibition**: A paginated, tag-filtered feed showcasing the latest commissioned work from across the platform.
- **Trending Blueprints**: Smart algorithms that surface the most "endorsed" work from the past 7 days.

###  Master Oversight (Admin Dashboard)
- **Site Analytics**: A centralized dashboard for workshop owners to monitor live counts of builders, published blueprints, inspections (views), and endorsements.
- **User & Content Management**: Powerful administrative tools to suspend accounts or delete blueprints to maintain workshop standards.

### Security & Infrastructure
- **Omni-Login**: Secure authentication via traditional credentials or social providers (Google & GitHub).
- **Email Dispatch Service**: Automated, workshop-themed notifications (Welcome, Follow, Like) powered by Resend and Nodemailer.
- **Security Hardening**: Rate limiting on API/Auth routes, JWT-based sessions with HttpOnly cookies, and Bcrypt password encryption.

---

##  Technical Blueprint

- **Core Stack**: Node.js, Express.js (ES Modules)
- **Database**: MongoDB (Mongoose ODM)
- **Templating**: EJS with a custom Vanilla CSS design system
- **Auth**: Passport.js + JWT
- **Email**: Resend (SMTP)

---

##  Getting Started
Refer to the [deployment guide](docs/deployment.md) for full production instructions, or follow these steps for local development:

1.  **Clone & Install**: `npm install`
2.  **Launch Construction**: `npm run dev`

---

## � Project Status
ThinkNote is currently at **Version 1.0 (Stable)**. It is fully deployed, verified, and ready for use in the production workshop. �🏗️

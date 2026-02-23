import transporter from '../config/mailer.js';

const EMAIL_FROM = process.env.EMAIL_FROM || 'ThinkNote <noreply@thinknote.app>';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Centralized Mail Service for The Architect's Workshop
 */
const mailService = {
  /**
   * Send Credential Validation (Email Verification)
   */
  sendVerificationEmail: async (email, token) => {
    const verifyUrl = `${BASE_URL}/auth/verify/${token}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c0f05; background-color: #fff8f2; border: 1px solid #f0d9c4; border-radius: 12px;">
        <h2 style="color: #ea580c; margin-bottom: 20px;">Credential Validation Required</h2>
        <p style="font-size: 16px; line-height: 1.6;">Welcome to the Workshop, Architect.</p>
        <p style="font-size: 16px; line-height: 1.6;">To fully commission your blueprints and join the network of builders, please validate your credentials by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Validate Credentials</a>
        </div>
        <p style="font-size: 14px; color: #7a5230;">If the button doesn't work, copy and paste this link: <br> ${verifyUrl}</p>
        <hr style="border: none; border-top: 1px solid #f0d9c4; margin: 20px 0;">
        <p style="font-size: 12px; color: #c49a72;">© 2026 ThinkNote — Draft. Engineer. Build.</p>
      </div>
    `;

    return transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'Action Required: Validate Your Workshop Credentials',
      html
    });
  },

  /**
   * Send Blueprint Recovery (Password Reset)
   */
  sendPasswordResetEmail: async (email, token) => {
    const resetUrl = `${BASE_URL}/auth/reset-password/${token}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c0f05; background-color: #fff8f2; border: 1px solid #f0d9c4; border-radius: 12px;">
        <h2 style="color: #ea580c; margin-bottom: 20px;">Credential Recovery Dispatched</h2>
        <p style="font-size: 16px; line-height: 1.6;">We received a request to recover access to your Workshop Studio.</p>
        <p style="font-size: 16px; line-height: 1.6;">Click the button below to update your credentials. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Credentials</a>
        </div>
        <p style="font-size: 14px; color: #7a5230;">If you did not request this, you can safely ignore this dispatch.</p>
        <hr style="border: none; border-top: 1px solid #f0d9c4; margin: 20px 0;">
        <p style="font-size: 12px; color: #c49a72;">© 2026 ThinkNote — Draft. Engineer. Build.</p>
      </div>
    `;

    return transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'Workshop Alert: Credential Recovery Dispatch',
      html
    });
  },

  /**
   * Send New Fellow Builder (Follow Notification)
   */
  sendFollowNotification: async (recipientEmail, followerName, followerUsername) => {
    const profileUrl = `${BASE_URL}/u/${followerUsername}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c0f05; background-color: #fff8f2; border: 1px solid #f0d9c4; border-radius: 12px;">
        <h2 style="color: #ea580c; margin-bottom: 20px;">New Fellow Builder Joined Your Network</h2>
        <p style="font-size: 16px; line-height: 1.6;"><strong>${followerName}</strong> (@${followerUsername}) is now studying your blueprints.</p>
        <p style="font-size: 16px; line-height: 1.6;">Your network of architects is growing. Keep building.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${profileUrl}" style="background: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Architect Profile</a>
        </div>
        <hr style="border: none; border-top: 1px solid #f0d9c4; margin: 20px 0;">
        <p style="font-size: 12px; color: #c49a72;">Want to silence these dispatches? Update your Workshop Preferences in Settings.</p>
      </div>
    `;

    return transporter.sendMail({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: 'Workshop Dispatch: A New Builder is Following You',
      html
    });
  },

  /**
   * Send Blueprint Inspected (Like Notification)
   */
  sendLikeNotification: async (recipientEmail, inspectorName, blueprintTitle, blueprintSlug) => {
    const blueprintUrl = `${BASE_URL}/post/${blueprintSlug}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c0f05; background-color: #fff8f2; border: 1px solid #f0d9c4; border-radius: 12px;">
        <h2 style="color: #ea580c; margin-bottom: 20px;">Blueprint Inspection Logged</h2>
        <p style="font-size: 16px; line-height: 1.6;"><strong>${inspectorName}</strong> found your blueprint, <em>"${blueprintTitle}"</em>, highly inventive.</p>
        <p style="font-size: 16px; line-height: 1.6;">Your architectural work is gaining traction in the workshop.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${blueprintUrl}" style="background: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Review Blueprint</a>
        </div>
        <hr style="border: none; border-top: 1px solid #f0d9c4; margin: 20px 0;">
        <p style="font-size: 12px; color: #c49a72;">Want to silence these dispatches? Update your Workshop Preferences in Settings.</p>
      </div>
    `;

    return transporter.sendMail({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: 'Workshop Dispatch: Your Blueprint was Inspected',
      html
    });
  },

  /**
   * Send Blueprint Commented (Comment Notification)
   */
  sendCommentNotification: async (recipientEmail, commenterName, blueprintTitle, blueprintSlug, commentSnippet) => {
    const blueprintUrl = `${BASE_URL}/post/${blueprintSlug}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c0f05; background-color: #fff8f2; border: 1px solid #f0d9c4; border-radius: 12px;">
        <h2 style="color: #ea580c; margin-bottom: 20px;">New Blueprint Review</h2>
        <p style="font-size: 16px; line-height: 1.6;"><strong>${commenterName}</strong> left a review on your blueprint, <em>"${blueprintTitle}"</em>:</p>
        <blockquote style="background: #fdf2e9; border-left: 4px solid #f97316; padding: 10px 15px; margin: 20px 0; font-style: italic;">
          "${commentSnippet}"
        </blockquote>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${blueprintUrl}" style="background: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Respond to Review</a>
        </div>
        <hr style="border: none; border-top: 1px solid #f0d9c4; margin: 20px 0;">
        <p style="font-size: 12px; color: #c49a72;">Want to silence these dispatches? Update your Workshop Preferences in Settings.</p>
      </div>
    `;

    return transporter.sendMail({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: 'Workshop Dispatch: New Review on Your Blueprint',
      html
    });
  }
};

export default mailService;

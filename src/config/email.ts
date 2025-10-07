import FormData from 'form-data';
import Mailgun from 'mailgun.js';

// Initialize Mailgun client
let mg: any = null;

export const initializeEmailTransporter = (): void => {
  const isConfigured = !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN);
  
  if (isConfigured) {
    const mailgun = new Mailgun(FormData);
    mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY!,
      url: process.env.MAILGUN_URL || 'https://api.mailgun.net',
    });
    console.log('✅ Mailgun email client initialized');
  } else {
    console.log('⚠️  Mailgun not configured - Add MAILGUN_API_KEY and MAILGUN_DOMAIN to .env');
  }
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    if (!mg) {
      console.log('⚠️  Email not sent - Mailgun not configured');
      return false;
    }
    
    const messageData = await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: process.env.MAILGUN_FROM || `L2H Blog <postmaster@${process.env.MAILGUN_DOMAIN}>`,
      to: [to],
      subject,
      html,
    });
    
    console.log('✅ Email sent:', messageData.id);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

export const sendOTPEmail = async (
  to: string,
  otp: string,
  purpose: string
): Promise<boolean> => {
  const subject = `Your OTP for ${purpose}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #1e3a8a; letter-spacing: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>L2H Blog</h1>
          <p>One-Time Password</p>
        </div>
        <div class="content">
          <h2>Hello!</h2>
          <p>You requested a one-time password for <strong>${purpose}</strong>.</p>
          <div class="otp-box">
            <p style="margin: 0; color: #6b7280;">Your OTP is:</p>
            <div class="otp-code">${otp}</div>
          </div>
          <p><strong>⏰ This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</strong></p>
          <p>If you didn't request this code, please ignore this email.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} L2H Blog. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(to, subject, html);
};

export const sendNewsletterWelcomeEmail = async (
  to: string,
  name?: string
): Promise<boolean> => {
  const subject = 'Welcome to L2H Blog Newsletter! 🎉';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to L2H Blog! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hello ${name || 'there'}!</h2>
          <p>Thank you for subscribing to our newsletter. You'll now receive:</p>
          <ul>
            <li>📚 Latest blog posts and articles</li>
            <li>💡 Career insights and tips</li>
            <li>🎯 Industry trends and updates</li>
            <li>✨ Exclusive content for subscribers</li>
          </ul>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/blog" class="button">Explore Our Blog</a>
          </p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} L2H Blog. All rights reserved.</p>
            <p><a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(to, subject, html);
};




import FormData from 'form-data';
import Mailgun from 'mailgun.js';

// Check if Mailgun credentials are configured
const isEmailConfigured = !!(
  process.env.MAILGUN_API_KEY &&
  process.env.MAILGUN_DOMAIN
);

// Initialize Mailgun client
let mg: any = null;

if (isEmailConfigured) {
  const mailgun = new Mailgun(FormData);
  mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY!,
    url: process.env.MAILGUN_URL || 'https://api.mailgun.net', // Use EU endpoint if needed: https://api.eu.mailgun.net
  });
  console.log('✅ Mailgun client initialized successfully');
  console.log(`📧 Using domain: ${process.env.MAILGUN_DOMAIN}`);
} else {
  console.log('⚠️  Email not configured - Mailgun credentials missing in .env');
  console.log('💡 System will work without email. Add MAILGUN_API_KEY and MAILGUN_DOMAIN to enable emails.');
}

/**
 * Send ebook download email with PDF link
 */
export async function sendDownloadEmail(
  email: string,
  name: string,
  ebookName: string,
  downloadUrl: string
): Promise<void> {
  // If email is not configured, log and skip
  if (!mg) {
    console.log(`📧 Email not sent (not configured) - Would send to: ${email} for ebook: ${ebookName}`);
    return;
  }
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
        }
        .content p {
          margin: 15px 0;
          font-size: 16px;
        }
        .ebook-name {
          color: #667eea;
          font-weight: bold;
        }
        .download-btn {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 8px;
          margin: 25px 0;
          font-weight: bold;
          font-size: 16px;
          transition: transform 0.2s;
        }
        .download-btn:hover {
          transform: translateY(-2px);
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .link-container {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          word-break: break-all;
        }
        .link-container a {
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
        }
        .footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          color: #666;
          font-size: 13px;
        }
        .footer p {
          margin: 5px 0;
        }
        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 25px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 Your Ebook is Ready!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>
          
          <p>Thank you for downloading <span class="ebook-name">${ebookName}</span> from CounselIndia!</p>
          
          <p>Your ebook is ready to download. Click the button below to get instant access:</p>
          
          <div class="button-container">
            <a href="${downloadUrl}" class="download-btn">📥 Download Ebook Now</a>
          </div>
          
          <div class="divider"></div>
          
          <p><strong>Alternative download link:</strong></p>
          <div class="link-container">
            <a href="${downloadUrl}">${downloadUrl}</a>
          </div>
          
          <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
          
          <p>Best regards,<br><strong>The CounselIndia Team</strong></p>
        </div>
        <div class="footer">
          <p><strong>CounselIndia</strong></p>
          <p>Empowering students with knowledge</p>
          <p style="margin-top: 15px;">This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hi ${name},

Thank you for downloading ${ebookName} from CounselIndia!

Download your ebook here: ${downloadUrl}

Best regards,
The CounselIndia Team

---
This is an automated email. Please do not reply to this message.
  `;

  try {
    const messageData = await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: process.env.MAILGUN_FROM || `CounselIndia <postmaster@${process.env.MAILGUN_DOMAIN}>`,
      to: [email],
      subject: `📚 Download ${ebookName} - CounselIndia`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`✅ Email sent successfully to ${email}`, messageData.id);
  } catch (error: any) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    throw error;
  }
}

/**
 * Send bulk emails (for admin bulk send)
 */
export async function sendBulkDownloadEmails(
  emails: string[],
  ebookName: string,
  downloadUrl: string
): Promise<{ success: string[]; failed: string[] }> {
  // If email is not configured, return all as "success" (for testing)
  if (!mg) {
    console.log(`📧 Bulk email not sent (not configured) - Would send to ${emails.length} emails for: ${ebookName}`);
    return { success: emails, failed: [] };
  }

  const success: string[] = [];
  const failed: string[] = [];

  for (const email of emails) {
    try {
      await sendDownloadEmail(email, 'Valued User', ebookName, downloadUrl);
      success.push(email);
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
      failed.push(email);
    }
  }

  return { success, failed };
}

export { mg as mailgunClient };



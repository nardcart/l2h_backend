/**
 * Mailgun Email Configuration Test Script
 * 
 * This script tests your Mailgun email configuration
 * Usage: node test-email.js your-test-email@example.com
 */

require('dotenv').config();
const FormData = require('form-data');
const Mailgun = require('mailgun.js');

// Get test email from command line
const testEmail = process.argv[2];

if (!testEmail) {
  console.log('❌ Please provide a test email address');
  console.log('Usage: node test-email.js your-email@example.com');
  process.exit(1);
}

console.log('🧪 Testing Mailgun Configuration...\n');

// Check if Mailgun credentials are configured
console.log('📋 Configuration Check:');
console.log(`   MAILGUN_API_KEY: ${process.env.MAILGUN_API_KEY ? '✅ Set (hidden)' : '❌ Not Set'}`);
console.log(`   MAILGUN_DOMAIN: ${process.env.MAILGUN_DOMAIN || '❌ Not Set'}`);
console.log(`   MAILGUN_FROM: ${process.env.MAILGUN_FROM || '❌ Not Set'}`);
console.log(`   MAILGUN_URL: ${process.env.MAILGUN_URL || 'https://api.mailgun.net (default)'}`);
console.log('');

if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
  console.log('❌ ERROR: Mailgun credentials are not configured!');
  console.log('');
  console.log('📝 Please create a .env file in the backend/ directory with:');
  console.log('   MAILGUN_API_KEY=your-api-key');
  console.log('   MAILGUN_DOMAIN=sandbox123.mailgun.org');
  console.log('   MAILGUN_FROM="Your Name" <postmaster@sandbox123.mailgun.org>');
  console.log('   MAILGUN_URL=https://api.mailgun.net');
  console.log('');
  console.log('See EMAIL_SETUP_GUIDE.md for detailed instructions');
  process.exit(1);
}

// Initialize Mailgun client
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: process.env.MAILGUN_URL || 'https://api.mailgun.net',
});

console.log('🔌 Mailgun client initialized');
console.log('');
console.log(`📧 Sending test email to: ${testEmail}`);
console.log('');

// Send test email using Mailgun
(async () => {
  try {
    const messageData = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: process.env.MAILGUN_FROM || `Test <postmaster@${process.env.MAILGUN_DOMAIN}>`,
      to: [testEmail],
      subject: '✅ Mailgun Configuration Test - Success!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Mailgun Configuration Test</h1>
            </div>
            <div class="content">
              <div class="success-box">
                <h2 style="color: #059669; margin-top: 0;">🎉 Success!</h2>
                <p>Your Mailgun configuration is working correctly!</p>
              </div>
              
              <h3>Configuration Details:</h3>
              <ul>
                <li><strong>Mailgun Domain:</strong> ${process.env.MAILGUN_DOMAIN}</li>
                <li><strong>API Endpoint:</strong> ${process.env.MAILGUN_URL || 'https://api.mailgun.net'}</li>
                <li><strong>From:</strong> ${process.env.MAILGUN_FROM || `postmaster@${process.env.MAILGUN_DOMAIN}`}</li>
              </ul>
              
              <p>Your backend can now send emails for:</p>
              <ul>
                <li>📚 Ebook downloads</li>
                <li>🔐 OTP verification</li>
                <li>📧 Newsletter subscriptions</li>
              </ul>
              
              <p><strong>Next steps:</strong></p>
              <ol>
                <li>Restart your backend server</li>
                <li>Test ebook download at http://localhost:8080/ebooks</li>
                <li>Check that emails are delivered successfully</li>
                <li>Check Mailgun logs: https://app.mailgun.com/app/logs</li>
              </ol>
              
              <p><strong>Note:</strong> If using sandbox domain, make sure recipient is added as authorized recipient in Mailgun dashboard.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log('');
    console.log(`📬 Message ID: ${messageData.id}`);
    console.log(`📧 Email sent to: ${testEmail}`);
    console.log('');
    console.log('🎉 Your Mailgun configuration is working!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Check the inbox of:', testEmail);
    console.log('2. If using sandbox, verify recipient is authorized');
    console.log('3. Check Mailgun logs: https://app.mailgun.com/app/logs');
    console.log('4. Restart your backend server');
    console.log('5. Test ebook downloads on your website');
    console.log('');
    console.log('✅ All done!');
  } catch (error) {
    console.log('❌ Failed to send test email!');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    console.log('💡 Common Fixes:');
    console.log('   1. Check API key is correct');
    console.log('   2. For sandbox: Add recipient as authorized in Mailgun dashboard');
    console.log('   3. Verify MAILGUN_DOMAIN matches your Mailgun domain');
    console.log('   4. Check Mailgun logs: https://app.mailgun.com/app/logs');
    console.log('   5. EU users: Use MAILGUN_URL=https://api.eu.mailgun.net');
    process.exit(1);
  }
})();


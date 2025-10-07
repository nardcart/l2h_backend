/**
 * Test script to verify Vercel Blob upload functionality
 * 
 * Usage:
 *   node test-blob-upload.js
 * 
 * This script will:
 * 1. Check if BLOB_READ_WRITE_TOKEN is set
 * 2. Test uploading a small file to Vercel Blob
 * 3. Verify the upload was successful
 */

const { put } = require('@vercel/blob');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
console.log('📂 Loading .env from:', envPath);
console.log('📂 .env file exists:', fs.existsSync(envPath));

dotenv.config({ path: envPath });

console.log('\n🔍 Environment Variables Check:');
console.log('================================');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? '✅ Set' : '❌ NOT SET');

if (process.env.BLOB_READ_WRITE_TOKEN) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const isPlaceholder = token.includes('REPLACE') || token === 'REPLACE_WITH_YOUR_ACTUAL_TOKEN';
  
  if (isPlaceholder) {
    console.log('\n❌ ERROR: BLOB_READ_WRITE_TOKEN is still a placeholder!');
    console.log('Please update it with your actual token from:');
    console.log('👉 https://vercel.com/dashboard/stores\n');
    process.exit(1);
  }
  
  console.log('Token preview:', token.substring(0, 20) + '...');
}

console.log('================================\n');

// Check if token is set
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ ERROR: BLOB_READ_WRITE_TOKEN is not set in .env file!');
  console.error('\n📝 Please add it to backend/.env:');
  console.error('   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx\n');
  console.error('Get your token from: https://vercel.com/dashboard/stores\n');
  process.exit(1);
}

// Test upload function
async function testBlobUpload() {
  try {
    console.log('🚀 Starting Vercel Blob upload test...\n');
    
    // Create a test file content
    const testContent = `Test upload from L2H Blog Backend
Created at: ${new Date().toISOString()}
This is a test file to verify Vercel Blob integration.`;
    
    const buffer = Buffer.from(testContent);
    const filename = `test-uploads/test-${Date.now()}.txt`;
    
    console.log('📤 Uploading test file...');
    console.log('   Filename:', filename);
    console.log('   Size:', buffer.length, 'bytes');
    
    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'text/plain',
    });
    
    console.log('\n✅ Upload successful!');
    console.log('================================');
    console.log('📦 Blob details:');
    console.log('   URL:', blob.url);
    console.log('   Pathname:', blob.pathname);
    console.log('   Content Type:', blob.contentType);
    console.log('   Size:', blob.size, 'bytes');
    console.log('   Upload Time:', new Date(blob.uploadedAt).toLocaleString());
    console.log('================================\n');
    
    console.log('🎉 Vercel Blob is working correctly!');
    console.log('You can access your test file at:');
    console.log('👉', blob.url);
    console.log('\n✅ Your backend is ready to handle file uploads!\n');
    
    return true;
  } catch (error) {
    console.error('\n❌ Upload failed!');
    console.error('================================');
    console.error('Error:', error.message);
    
    if (error.message.includes('401')) {
      console.error('\n💡 This is an authentication error. Your token might be:');
      console.error('   - Invalid or expired');
      console.error('   - Missing proper permissions');
      console.error('   - Not copied correctly');
      console.error('\n📝 Get a new token from: https://vercel.com/dashboard/stores');
    } else if (error.message.includes('network')) {
      console.error('\n💡 This is a network error. Check your internet connection.');
    } else {
      console.error('\nFull error details:');
      console.error(error);
    }
    
    console.error('================================\n');
    return false;
  }
}

// Run the test
console.log('🧪 Vercel Blob Upload Test');
console.log('================================\n');

testBlobUpload()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });


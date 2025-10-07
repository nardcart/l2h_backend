// Vercel Blob configuration
// Note: Don't check at module load time - check when actually needed
// This allows dotenv to load first

export const isBlobAvailable = () => !!process.env.BLOB_READ_WRITE_TOKEN;

// Export token for use with Vercel Blob SDK
export const BLOB_READ_WRITE_TOKEN = () => process.env.BLOB_READ_WRITE_TOKEN || '';


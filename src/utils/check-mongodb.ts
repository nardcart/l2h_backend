import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const mongoUri = process.env.MONGODB_URI;

const maskMongoUri = (uri: string): string => {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
};

const run = async (): Promise<void> => {
  console.log(`Loading .env from: ${envPath}`);

  if (!mongoUri) {
    console.error('MONGODB_URI is missing in .env');
    process.exit(1);
  }

  console.log(`Testing MongoDB connection with: ${maskMongoUri(mongoUri)}`);

  try {
    const start = Date.now();

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    const duration = Date.now() - start;
    console.log('MongoDB connection successful');
    console.log(`Database: ${mongoose.connection.name || '(unknown)'}`);
    console.log(`Host: ${mongoose.connection.host || '(unknown)'}`);
    console.log(`Connected in ${duration}ms`);

    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('MongoDB connection failed');

    if (error instanceof Error) {
      console.error(`Name: ${error.name}`);
      console.error(`Message: ${error.message}`);
    } else {
      console.error(error);
    }

    process.exit(1);
  }
};

run();

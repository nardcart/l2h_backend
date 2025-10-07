import mongoose from 'mongoose';
import Blog from '../models/Blog';
import BlogCategory from '../models/BlogCategory';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const recalculatePostCounts = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/l2h_blog';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all categories
    const categories = await BlogCategory.find();
    console.log(`\n📊 Found ${categories.length} categories`);

    // Recalculate post count for each category
    for (const category of categories) {
      // Count only published blogs in this category
      const count = await Blog.countDocuments({
        categoryId: category._id,
        status: 'published'
      });

      // Update the category's postCount
      await BlogCategory.findByIdAndUpdate(category._id, { postCount: count });
      
      console.log(`✅ ${category.name} (${category.slug}): ${count} published posts`);
    }

    console.log('\n✅ Post counts recalculated successfully!');
    
    // Close connection
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error recalculating post counts:', error.message);
    process.exit(1);
  }
};

// Run the script
recalculatePostCounts();


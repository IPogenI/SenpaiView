import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    // Debug information
    const db = mongoose.connection;
    console.log('📊 Connected to database:', db.name);
    const collections = await db.db.listCollections().toArray();
    console.log('📑 Available collections:', collections.map(c => c.name));
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;

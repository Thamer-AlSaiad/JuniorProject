import * as mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI as string;
    let dbName = 'visualization_db'; 
    
    const uriParts = mongoUri.split('?')[0].split('/');
    if (uriParts.length > 3 && uriParts[3]) {
      dbName = uriParts[3];
    }
    
    const conn = await mongoose.connect(mongoUri, {
      dbName: dbName 
    });
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;

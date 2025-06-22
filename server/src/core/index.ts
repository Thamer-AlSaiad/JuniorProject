import app from './app';
import connectDB from '../data/mongodb/client';

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB database');
  
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
startServer();
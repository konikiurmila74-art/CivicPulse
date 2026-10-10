import mongoose from 'mongoose';

export default function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      'FATAL: MONGODB_URI is not set. Copy server/.env.example to server/.env and add your MongoDB Atlas connection string.'
    );
    process.exit(1);
  }

  mongoose.set('strictQuery', true);

  mongoose
    .connect(uri)
    .then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
      if (process.env.NODE_ENV !== 'production' && global.app) {
        global.app.set('mongooseState', 'connected');
      }
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });

  mongoose.connection.on('connected', () => {
    if (global.app) global.app.set('mongooseState', 'connected');
  });
  mongoose.connection.on('error', () => {
    if (global.app) global.app.set('mongooseState', 'error');
  });
  mongoose.connection.on('disconnected', () => {
    if (global.app) global.app.set('mongooseState', 'disconnected');
  });
}

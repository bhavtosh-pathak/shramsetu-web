import mongoose from 'mongoose';

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Copy server/.env.example to server/.env and configure it.');
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  } catch (err) {
    throw new Error(`MongoDB connection failed (${err.message}). Check MONGODB_URI, DB user password and Atlas Network Access IP list.`);
  }
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

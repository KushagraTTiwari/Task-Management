import mongoose from 'mongoose';
import configVariables from './config.js';

const connectDB = async () => {
  try {
    await mongoose.connect(configVariables.mongoURL);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
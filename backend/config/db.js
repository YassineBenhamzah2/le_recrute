import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recrutement_ccp';
  if (uri.includes('localhost')) {
    uri = uri.replace('localhost', '127.0.0.1');
  }
  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected : ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message || error}`.red.underline.bold);
    console.log('Retrying MongoDB connection in 5 seconds...'.yellow);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;

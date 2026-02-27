import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urja';

export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected:', MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@'));
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err);
        process.exit(1);
    }
}

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
});

export default mongoose;

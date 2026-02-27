import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urja';

export async function connectDB(): Promise<void> {
    try {
        if (mongoose.connection.readyState >= 1) return; // already connected
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err);
        throw err; // don't process.exit in serverless!
    }
}

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

export default mongoose;

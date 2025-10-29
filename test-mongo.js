// test-mongo.js (ESM)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;
console.log('Using MONGO_URI (hidden):', uri ? uri.replace(/:\/\/(.*?):/, '://***:') : '(empty)');

async function runTest() {
    try {
        await mongoose.connect(uri, {});
        console.log('Connected to MongoDB ✅');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('MongoDB connection error ❌', err.message || err);
        process.exit(1);
    }
}

runTest();

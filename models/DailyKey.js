// models/DailyKey.js
import mongoose from "mongoose";

const dailyKeySchema = new mongoose.Schema({
    chatId: { type: String, required: true },
    key: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
        // 🕒 TTL index — document auto-deletes 24 h after creation
        expires: 60 * 60 * 24,
    },
});

// each (chatId, key) unique
dailyKeySchema.index({ chatId: 1, key: 1 }, { unique: true });

export default mongoose.model("DailyKey", dailyKeySchema);

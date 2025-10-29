// models/PendingResume.js
import mongoose from "mongoose";

const PendingResumeSchema = new mongoose.Schema({
    chatId: { type: String },                // Telegram chat id (string)
    template: { type: String, default: "experienced" },
    data: { type: Object, default: {} },     // prefilled JSON from bot/n8n or frontend
    fileUrl: { type: String },               // optional uploaded resume url
    status: { type: String, default: "pending" }, // pending / completed
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
});

export default mongoose.model("PendingResume", PendingResumeSchema);

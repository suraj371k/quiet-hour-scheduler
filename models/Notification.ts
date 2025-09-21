import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timeBlockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TimeBlock",
    required: true,
  },
  scheduledFor: {
    type: Date,
    required: true,
  },
  sentAt: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
  },
  attempts: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
    required: false,
  },
});

// Compound index to prevent duplicates
NotificationSchema.index({ userId: 1, timeBlockId: 1 }, { unique: true });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
export default Notification;

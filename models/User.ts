import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  supabaseUserId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: false
  },
  timeZone: {
    type: String,
    default: 'UTC'
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    // can add more notification channels later
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.models.User || mongoose.model("User" , UserSchema)

export default User;
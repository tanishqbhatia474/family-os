import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      default: null
    },

    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      default: null
    },

    isHonor: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('User', userSchema);

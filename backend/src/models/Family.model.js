import mongoose from 'mongoose';

const familySchema = new mongoose.Schema(
  {
    familyName: {
      type: String,
      required: true,
      trim: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    inviteCode: {
      type: String,
      unique: true,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Family', familySchema);

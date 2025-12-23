import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true
    },

    ownerPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      required: true
    },

    fileUrl: {
      type: String,
      required: true
    },

    viewAccessPersonIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
        index: true
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Document', documentSchema);

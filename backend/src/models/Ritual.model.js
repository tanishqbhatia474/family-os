import mongoose from 'mongoose';

const ritualSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true
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

    description: {
      type: String,
      required: true,
      trim: true
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

export default mongoose.model('Ritual', ritualSchema);

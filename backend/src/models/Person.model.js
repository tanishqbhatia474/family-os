import mongoose from 'mongoose';

const personSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },

    birthDate: {
      type: Date
    },

    isDeceased: {
      type: Boolean,
      default: false
    },

    fatherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      default: null,
      index: true
    },

    motherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      default: null,
      index: true
    },

    spouseIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
      }
    ]
  },
  {
    timestamps: true
  }
);

// 🔒 COMPOUND UNIQUE INDEX: Prevent duplicate persons
// Fields: familyId, name, birthDate, gender
// This guarantees zero duplicates even under race conditions
personSchema.index(
  {
    familyId: 1,
    name: 1,
    birthDate: 1,
    gender: 1
  },
  { unique: true }
);

export default mongoose.model('Person', personSchema);

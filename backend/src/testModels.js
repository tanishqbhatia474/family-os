import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Family from './models/Family.model.js';
import Person from './models/Person.model.js';
import Ritual from './models/Ritual.model.js';

dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // 1️⃣ Create Family
    const family = await Family.create({
      familyName: 'Test Family',
      createdBy: new mongoose.Types.ObjectId(),
      inviteCode: 'TEST123'
    });

    console.log('✅ Family created:', family._id);

    // 2️⃣ Create Person
    const person = await Person.create({
      familyId: family._id,
      name: 'Test Person',
      gender: 'male'
    });

    console.log('✅ Person created:', person._id);

    // 3️⃣ Create Ritual
    const ritual = await Ritual.create({
      familyId: family._id,
      ownerPersonId: person._id,
      title: 'newborn baby first food',
      description: 'honey first',
      viewAccessPersonIds: []
    });

    console.log('✅ Ritual created:', ritual._id);

    console.log('🎉 ALL MODELS TESTED SUCCESSFULLY');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error testing models:', err);
    process.exit(1);
  }
};

runTest();

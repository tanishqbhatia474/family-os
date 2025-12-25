import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../config/s3.js';
import Document from '../models/Document.model.js';
import crypto from 'crypto';

export const uploadDocumentService = async (
  user,
  file,
  { title, type, viewAccessPersonIds = [] }
) => {
  if (!user.familyId || !user.personId) {
    throw new Error('User does not belong to a family or person');
  }

  if (!file) {
    throw new Error('File is required');
  }

  // Ensure owner always has access
  const accessSet = new Set(
    viewAccessPersonIds.map(id => id.toString())
  );
  accessSet.add(user.personId.toString());

  const fileExt = file.originalname.split('.').pop();
  const fileKey = `${user.familyId}/${user.personId}/${crypto.randomUUID()}.${fileExt}`;

  // Upload to S3
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  );

  const fileUrl = `s3://${process.env.AWS_S3_BUCKET_NAME}/${fileKey}`;

  // Save metadata in MongoDB
  const document = await Document.create({
    familyId: user.familyId,
    ownerPersonId: user.personId,
    title,
    type,
    fileUrl,
    viewAccessPersonIds: Array.from(accessSet)
  });

  return document;
};

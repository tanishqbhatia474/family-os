import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '../config/s3.js';
import Document from '../models/Document.model.js';
import crypto from 'crypto';
import { AppError } from '../utils/AppError.js';

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
export const getSignedDownloadUrlService = async (user, documentId) => {
  if (!user.familyId || !user.personId) {
    throw new Error('User does not belong to a family or person');
  }

  const document = await Document.findById(documentId);

  if (!document) {
    throw new AppError('Document not found', 404, 'NOT_FOUND');
  }

  // 🔒 ACCESS CHECK
  const hasAccess =
    document.ownerPersonId.toString() === user.personId.toString() ||
    document.viewAccessPersonIds
      .map(id => id.toString())
      .includes(user.personId.toString());

  if (!hasAccess) {
    throw new AppError('You do not have access to this document', 403, 'NOT_AUTHORIZED');
  }

  // Extract S3 key from fileUrl
  // fileUrl format: s3://bucket-name/path/to/file
  const key = document.fileUrl.replace(
    `s3://${process.env.AWS_S3_BUCKET_NAME}/`,
    ''
  );

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key
  });

  // Signed URL valid for 5 minutes
  const signedUrl = await getSignedUrl(s3, command, {
    expiresIn: 300
  });

  return signedUrl;
};
export const listDocumentsService = async (user) => {
  if (!user.familyId || !user.personId) {
    throw new Error('User does not belong to a family or person');
  }

  const documents = await Document.find({
    familyId: user.familyId,
    $or: [
      { ownerPersonId: user.personId },
      { viewAccessPersonIds: user.personId }
    ]
  })
    .sort({ createdAt: -1 })
    .select('-__v');

  return documents;
};
//export const deleteDocumentService = async (user, documentId) => {
  import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export const deleteDocumentService = async (user, documentId) => {
  if (!user.familyId || !user.personId) {
    throw new Error('User does not belong to a family or person');
  }

  const document = await Document.findById(documentId);

  if (!document) {
    throw new AppError('Document not found', 404, 'NOT_FOUND');
  }

  // 🔒 OWNER CHECK
  if (document.ownerPersonId.toString() !== user.personId.toString()) {
    throw new AppError('Only document owner can delete this document', 403, 'NOT_AUTHORIZED');
  }

  // Extract S3 key from fileUrl
  const key = document.fileUrl.replace(
    `s3://${process.env.AWS_S3_BUCKET_NAME}/`,
    ''
  );

  // Delete from S3
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    })
  );

  // Delete metadata from MongoDB
  await document.deleteOne();
};
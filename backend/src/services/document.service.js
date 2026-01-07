import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '../config/s3.js';
import Document from '../models/Document.model.js';
import crypto from 'crypto';
import { AppError } from '../utils/AppError.js';

import mongoose from "mongoose";

export const uploadDocumentService = async (
  user,
  file,
  { title, type, viewAccessPersonIds }
) => {
  console.log('=== Upload Service Started ===');
  console.log('User:', user);
  console.log('File:', file);
  console.log('Title:', title, 'Type:', type);
  console.log('ViewAccessPersonIds:', viewAccessPersonIds);

  if (!user.familyId || !user.personId) {
    throw new Error("User does not belong to a family or person");
  }

  if (!file) {
    throw new Error("File is required");
  }

  // ✅ FIX 1: normalize to array
  const rawIds = viewAccessPersonIds
    ? Array.isArray(viewAccessPersonIds)
      ? viewAccessPersonIds
      : [viewAccessPersonIds]
    : [];

  // ✅ FIX 2: cast to ObjectId
  const accessSet = new Set(
    rawIds.map(id => new mongoose.Types.ObjectId(id).toString())
  );

  // Owner always has access
  accessSet.add(user.personId.toString());

  const fileExt = file.originalname.split(".").pop();
  const fileKey = `${user.familyId}/${user.personId}/${crypto.randomUUID()}.${fileExt}`;

  console.log('S3 Config:', {
    bucket: process.env.AWS_S3_BUCKET_NAME,
    region: process.env.AWS_REGION,
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
  });

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );
    console.log('S3 upload successful');
  } catch (s3Error) {
    console.error('S3 upload failed:', s3Error);
    throw s3Error;
  }

  const fileUrl = `s3://${process.env.AWS_S3_BUCKET_NAME}/${fileKey}`;

  const document = await Document.create({
    familyId: user.familyId,
    ownerPersonId: user.personId,
    title,
    type: type || "OTHER", // ✅ FIX 3
    fileUrl,
    viewAccessPersonIds: Array.from(accessSet).map(
      id => new mongoose.Types.ObjectId(id)
    )
  });

  console.log('Document created:', document._id);
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
    Key: key,
    ResponseContentDisposition: `attachment; filename="${document.title || 'document'}"`
  });

  // Signed URL valid for 5 minutes
  const signedUrl = await getSignedUrl(s3, command, {
    expiresIn: 300
  });

  return signedUrl;
};

export const getSignedViewUrlService = async (user, documentId) => {
  if (!user.familyId || !user.personId) {
    throw new Error('User does not belong to a family or person');
  }

  const document = await Document.findById(documentId);

  if (!document) {
    throw new AppError('Document not found', 404, 'NOT_FOUND');
  }

  // 🔒 Same access check as download
  const hasAccess =
    document.ownerPersonId.toString() === user.personId.toString() ||
    document.viewAccessPersonIds
      .map(id => id.toString())
      .includes(user.personId.toString());

  if (!hasAccess) {
    throw new AppError('You do not have access to this document', 403, 'NOT_AUTHORIZED');
  }

  // Extract S3 key from fileUrl
  const key = document.fileUrl.replace(
    `s3://${process.env.AWS_S3_BUCKET_NAME}/`,
    ''
  );

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: 'inline' // ✅ KEY FIX: Opens in browser instead of downloading
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
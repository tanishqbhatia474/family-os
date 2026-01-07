import { uploadDocumentService ,getSignedDownloadUrlService, getSignedViewUrlService, listDocumentsService, deleteDocumentService } from '../services/document.service.js';

export const uploadDocument = async (req, res, next) => {
  try {
    console.log('Upload request received');
    console.log('User:', req.user);
    console.log('File:', req.file);
    console.log('Body:', req.body);
    
    const document = await uploadDocumentService(
      req.user,
      req.file,
      req.body
    );
    res.status(201).json(document);
  } catch (err) {
    console.error('Document upload error:', err);
    console.error('Error stack:', err.stack);
    next(err);
  }
};

export const viewDocument = async (req, res, next) => {
  try {
    const url = await getSignedViewUrlService(
      req.user,
      req.params.id
    );
    res.json({ url });
  } catch (err) {
    next(err);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const url = await getSignedDownloadUrlService(
      req.user,
      req.params.id
    );
    res.json({ url });
  } catch (err) {
    next(err);
  }
};
export const listDocuments = async (req, res, next) => {
  try {
    const documents = await listDocumentsService(req.user);
    res.json(documents);
  } catch (err) {
    next(err);
  }
};
export const deleteDocument = async (req, res, next) => {
  try {
    await deleteDocumentService(req.user, req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    next(err);
  }
};
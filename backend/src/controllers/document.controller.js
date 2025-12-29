import { uploadDocumentService ,getSignedDownloadUrlService, listDocumentsService, deleteDocumentService } from '../services/document.service.js';

export const uploadDocument = async (req, res, next) => {
  try {
    const document = await uploadDocumentService(
      req.user,
      req.file,
      req.body
    );
    res.status(201).json(document);
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
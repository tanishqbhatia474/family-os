import { uploadDocumentService ,getSignedDownloadUrlService, listDocumentsService, deleteDocumentService } from '../services/document.service.js';

export const uploadDocument = async (req, res) => {
  try {
    const document = await uploadDocumentService(
      req.user,
      req.file,
      req.body
    );
    res.status(201).json(document);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const downloadDocument = async (req, res) => {
  try {
    const url = await getSignedDownloadUrlService(
      req.user,
      req.params.id
    );
    res.json({ url });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};
export const listDocuments = async (req, res) => {
  try {
    const documents = await listDocumentsService(req.user);
    res.json(documents);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const deleteDocument = async (req, res) => {
  try {
    await deleteDocumentService(req.user, req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};
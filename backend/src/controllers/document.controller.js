import { uploadDocumentService } from '../services/document.service.js';

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

// module 02
const documentService = require('./document.service');

const uploadDocument = async (req, res, next) => {
  try {
    const document = await documentService.uploadDocument(
      req.user.userId,
      req.params.id,
      req.file,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationDocuments = async (req, res, next) => {
  try {
    const documents = await documentService.getApplicationDocuments(
      req.user.userId,
      req.user.role,
      req.params.id
    );

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

const downloadDocument = async (req, res, next) => {
  try {
    const { document, absoluteFilePath } = await documentService.getDocumentById(
      req.user.userId,
      req.user.role,
      req.params.documentId
    );

    res.download(absoluteFilePath, document.originalName);
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const result = await documentService.deleteDocument(
      req.user.userId,
      req.params.id,
      req.params.documentId
    );

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getApplicationDocuments,
  downloadDocument,
  deleteDocument
};

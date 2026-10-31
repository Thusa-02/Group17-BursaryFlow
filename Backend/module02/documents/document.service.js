// module 02
const path = require('path');
const fs = require('fs');
const { ApplicationDocument, DOCUMENT_TYPES, DOCUMENT_VERIFICATION_STATUS } = require('./document.model');
const { BursaryApplication, APPLICATION_STATUS } = require('../applications/application.model');
const Student = require('../../module1/students/student.model');
const { ROLES, normalizeRole } = require('../../config/constants');

class DocumentService {
  /**
   * Upload and attach a document to a bursary application
   */
  async uploadDocument(userId, applicationId, file, body) {
    if (!file) {
      const error = new Error('No file uploaded');
      error.statusCode = 400;
      throw error;
    }

    const student = await Student.findOne({ userId });
    if (!student) {
      // Clean up uploaded file if student is not found
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const error = new Error('Student profile not found for authenticated user');
      error.statusCode = 404;
      throw error;
    }

    const application = await BursaryApplication.findById(applicationId);
    if (!application) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    // Ownership check
    if (application.studentId.toString() !== student._id.toString()) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const error = new Error('Unauthorized: You can only upload documents to your own application');
      error.statusCode = 403;
      throw error;
    }

    // Deadline and status check
    const editableStatuses = [
      APPLICATION_STATUS.DRAFT,
      APPLICATION_STATUS.EDITING,
      APPLICATION_STATUS.CORRECTION_REQUIRED
    ];

    if (!editableStatuses.includes(application.status)) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const error = new Error(`Cannot upload documents: Application is currently in ${application.status} status.`);
      error.statusCode = 400;
      throw error;
    }

    if (application.editDeadline && new Date() > new Date(application.editDeadline) && application.status !== APPLICATION_STATUS.DRAFT) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const error = new Error('Application editing period has ended. No new documents can be uploaded.');
      error.statusCode = 400;
      throw error;
    }

    // Validate documentType
    const documentType = body.documentType ? body.documentType.trim().toUpperCase() : null;
    if (!documentType || !DOCUMENT_TYPES[documentType]) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const error = new Error(`Invalid or missing documentType. Allowed types: ${Object.keys(DOCUMENT_TYPES).join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    if (documentType === DOCUMENT_TYPES.OTHER && (!body.otherDescription || !body.otherDescription.trim())) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const error = new Error('otherDescription is required when documentType is OTHER');
      error.statusCode = 400;
      throw error;
    }

    const relativePath = `/uploads/documents/${file.filename}`;

    const newDocument = await ApplicationDocument.create({
      applicationId: application._id,
      studentId: student._id,
      documentType,
      otherDescription: documentType === DOCUMENT_TYPES.OTHER ? body.otherDescription.trim() : '',
      fileName: file.filename,
      originalName: file.originalname,
      filePath: relativePath,
      fileUrl: relativePath,
      fileType: file.mimetype,
      fileSize: file.size,
      verificationStatus: DOCUMENT_VERIFICATION_STATUS.PENDING
    });

    return newDocument;
  }

  /**
   * Get all documents attached to an application
   */
  async getApplicationDocuments(userId, userRole, applicationId) {
    const application = await BursaryApplication.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    const canonicalRole = normalizeRole(userRole);

    // If student, check ownership
    if (canonicalRole === ROLES.STUDENT) {
      const student = await Student.findOne({ userId });
      if (!student || application.studentId.toString() !== student._id.toString()) {
        const error = new Error('Forbidden: Access denied to this application documents');
        error.statusCode = 403;
        throw error;
      }
    }

    const documents = await ApplicationDocument.find({ applicationId }).sort({ uploadedAt: -1 });
    return documents;
  }

  /**
   * Get single document and verify file exists on disk
   */
  async getDocumentById(userId, userRole, documentId) {
    const document = await ApplicationDocument.findById(documentId);
    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    const canonicalRole = normalizeRole(userRole);
    if (canonicalRole === ROLES.STUDENT) {
      const student = await Student.findOne({ userId });
      if (!student || document.studentId.toString() !== student._id.toString()) {
        const error = new Error('Forbidden: Access denied to this document');
        error.statusCode = 403;
        throw error;
      }
    }

    const absoluteFilePath = path.join(__dirname, '../../uploads/documents', document.fileName);
    if (!fs.existsSync(absoluteFilePath)) {
      const error = new Error('File does not exist on server storage');
      error.statusCode = 404;
      throw error;
    }

    return {
      document,
      absoluteFilePath
    };
  }

  /**
   * Delete an attached document
   */
  async deleteDocument(userId, applicationId, documentId) {
    const student = await Student.findOne({ userId });
    if (!student) {
      const error = new Error('Student profile not found');
      error.statusCode = 404;
      throw error;
    }

    const application = await BursaryApplication.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    if (application.studentId.toString() !== student._id.toString()) {
      const error = new Error('Unauthorized: You can only delete documents from your own application');
      error.statusCode = 403;
      throw error;
    }

    const editableStatuses = [
      APPLICATION_STATUS.DRAFT,
      APPLICATION_STATUS.EDITING,
      APPLICATION_STATUS.CORRECTION_REQUIRED
    ];

    if (!editableStatuses.includes(application.status)) {
      const error = new Error(`Cannot delete document: Application is in ${application.status} status.`);
      error.statusCode = 400;
      throw error;
    }

    if (application.editDeadline && new Date() > new Date(application.editDeadline) && application.status !== APPLICATION_STATUS.DRAFT) {
      const error = new Error('Application editing period has ended.');
      error.statusCode = 400;
      throw error;
    }

    const document = await ApplicationDocument.findOne({ _id: documentId, applicationId });
    if (!document) {
      const error = new Error('Document not found on this application');
      error.statusCode = 404;
      throw error;
    }

    // Remove file from disk
    const absoluteFilePath = path.join(__dirname, '../../uploads/documents', document.fileName);
    if (fs.existsSync(absoluteFilePath)) {
      try {
        fs.unlinkSync(absoluteFilePath);
      } catch (err) {
        console.error(`Failed to delete file from disk: ${err.message}`);
      }
    }

    await document.deleteOne();
    return { message: 'Document removed successfully', documentId };
  }
}

module.exports = new DocumentService();

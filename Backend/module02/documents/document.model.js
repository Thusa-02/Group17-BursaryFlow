// module 02
const mongoose = require('mongoose');

const DOCUMENT_TYPES = {
  SALARY_CERTIFICATE_FATHER: 'SALARY_CERTIFICATE_FATHER',
  SALARY_CERTIFICATE_MOTHER: 'SALARY_CERTIFICATE_MOTHER',
  SALARY_CERTIFICATE_GUARDIAN: 'SALARY_CERTIFICATE_GUARDIAN',
  SALARY_CERTIFICATE_SPOUSE: 'SALARY_CERTIFICATE_SPOUSE',
  PENSION_CERTIFICATE: 'PENSION_CERTIFICATE',
  DEATH_CERTIFICATE_FATHER: 'DEATH_CERTIFICATE_FATHER',
  DEATH_CERTIFICATE_MOTHER: 'DEATH_CERTIFICATE_MOTHER',
  RETIREMENT_CERTIFICATE: 'RETIREMENT_CERTIFICATE',
  BIRTH_CERTIFICATE_SIBLING: 'BIRTH_CERTIFICATE_SIBLING',
  HIGHER_ED_STUDENT_CONFIRMATION: 'HIGHER_ED_STUDENT_CONFIRMATION',
  INCOME_TAX_PAYMENT_DOC: 'INCOME_TAX_PAYMENT_DOC',
  ESTATE_LAND_DOC: 'ESTATE_LAND_DOC',
  HOUSE_PROPERTY_DOC: 'HOUSE_PROPERTY_DOC',
  APPLICANT_EMPLOYMENT_LEAVE_LETTER: 'APPLICANT_EMPLOYMENT_LEAVE_LETTER',
  MARRIAGE_CERTIFICATE: 'MARRIAGE_CERTIFICATE',
  GRAMASEVA_CERTIFICATE: 'GRAMASEVA_CERTIFICATE',
  OTHER: 'OTHER'
};

const DOCUMENT_VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
};

const applicationDocumentSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BursaryApplication',
      required: [true, 'Application ID reference is required']
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID reference is required']
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: Object.values(DOCUMENT_TYPES)
    },
    otherDescription: {
      type: String,
      trim: true,
      default: ''
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
      trim: true
    },
    fileUrl: {
      type: String,
      trim: true,
      default: ''
    },
    fileType: {
      type: String,
      trim: true,
      default: 'application/pdf'
    },
    fileSize: {
      type: Number,
      default: 0
    },
    verificationStatus: {
      type: String,
      enum: Object.values(DOCUMENT_VERIFICATION_STATUS),
      default: DOCUMENT_VERIFICATION_STATUS.PENDING
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'application_documents'
  }
);

applicationDocumentSchema.index({ applicationId: 1 });
applicationDocumentSchema.index({ studentId: 1 });

const ApplicationDocument = mongoose.model('ApplicationDocument', applicationDocumentSchema);

module.exports = {
  ApplicationDocument,
  DOCUMENT_TYPES,
  DOCUMENT_VERIFICATION_STATUS
};

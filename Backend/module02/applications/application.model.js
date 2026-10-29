// module 02
const mongoose = require('mongoose');

// Enum constants for Bursary Application status
const APPLICATION_STATUS = {
  DRAFT: 'DRAFT',
  EDITING: 'EDITING',
  SUBMITTED: 'SUBMITTED',
  GS_REVIEW: 'GS_REVIEW',
  DS_REVIEW: 'DS_REVIEW',
  WELFARE_REVIEW: 'WELFARE_REVIEW',
  COUNSELLOR_REVIEW: 'COUNSELLOR_REVIEW',
  BURSAR_REVIEW: 'BURSAR_REVIEW',
  REGISTRAR_REVIEW: 'REGISTRAR_REVIEW',
  COMMITTEE_REVIEW: 'COMMITTEE_REVIEW',
  CORRECTION_REQUIRED: 'CORRECTION_REQUIRED',
  APPROVED: 'APPROVED',
  HOLD: 'HOLD',
  NOT_APPROVED: 'NOT_APPROVED'
};

const bursaryApplicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID reference is required']
    },
    applicationNo: {
      type: String,
      required: [true, 'Application number is required'],
      unique: true,
      trim: true
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.DRAFT
    },
    applicationDate: {
      type: Date,
      default: Date.now
    },
    editDeadline: {
      type: Date
    },
    submittedAt: {
      type: Date,
      default: null
    },
    gsDivisionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GNDivision'
    },
    dsDivisionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DSDivision'
    },
    previousApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BursaryApplication',
      default: null
    },
    officerNotes: {
      type: String,
      default: ''
    },
    govVerified: {
      type: Boolean,
      default: false
    },
    govVerifiedDate: {
      type: Date,
      default: null
    },
    govDocumentRef: {
      type: String,
      default: null
    },

    // 1. Personal & Academic Information
    personalInformation: {
      gceAlIndexNo: { type: String, trim: true, default: '' },
      enrolmentNumber: { type: String, trim: true, default: '' },
      bocAccountNumber: { type: String, trim: true, default: '' },
      selectedCourse: { type: String, trim: true, default: '' },
      title: { type: String, enum: ['Mr.', 'Miss', 'Mrs.', 'Rev', ''], default: '' },
      fullName: { type: String, trim: true, default: '' },
      permanentAddress: { type: String, trim: true, default: '' },
      mobileNumber: { type: String, trim: true, default: '' },
      homeContactNumber: { type: String, trim: true, default: '' },
      nic: { type: String, trim: true, default: '' },
      gnDivision: { type: String, trim: true, default: '' },
      dsDivision: { type: String, trim: true, default: '' },
      district: { type: String, trim: true, default: '' },
      alDistrict: { type: String, trim: true, default: '' },
      distanceToUniversityKm: { type: Number, default: 0 },
      isSriLankanCitizen: { type: Boolean, default: true },
      isRegistered: { type: Boolean, default: true },
      studentType: { type: String, enum: ['internal', 'external'], default: 'internal' },
      studyMode: { type: String, enum: ['full-time', 'part-time'], default: 'full-time' },
      mahapolaStatus: { type: String, enum: ['NONE', 'RECEIVING', 'PENDING', 'UNKNOWN'], default: 'NONE' }
    },

    // 02. School-going siblings under 19
    familyMembers: [
      {
        name: { type: String, trim: true },
        dob: { type: Date },
        ageAsAtJan1: { type: Number },
        schoolOrInstitution: { type: String, trim: true }
      }
    ],

    // 03. Higher education siblings
    higherEdSiblings: [
      {
        name: { type: String, trim: true },
        alIndexNo: { type: String, trim: true },
        institutionName: { type: String, trim: true },
        course: { type: String, trim: true },
        yearOfStudy: { type: Number },
        receivingMahapolaOrBursary: { type: Boolean, default: false },
        scholarshipDetails: { type: String, trim: true, default: '' }
      }
    ],

    // 04. Income tax paying family members
    incomeTaxPayers: [
      {
        name: { type: String, trim: true },
        relationship: { type: String, trim: true },
        taxFileNo: { type: String, trim: true }
      }
    ],

    // 05. Previous University / Higher Ed Enrollment of Applicant
    previousHigherEducation: {
      followedEarlier: { type: Boolean, default: false },
      institutionName: { type: String, trim: true, default: '' },
      course: { type: String, trim: true, default: '' },
      periodOfStudy: { type: String, trim: true, default: '' },
      receivedLoanOrScholarship: { type: String, trim: true, default: '' }
    },

    // 06. Other Scholarships / Government funds received
    otherScholarships: {
      receiving: { type: Boolean, default: false },
      details: { type: String, trim: true, default: '' },
      amount: { type: Number, default: 0 }
    },

    // 07. Income derived from estates and cultivated land
    landIncome: [
      {
        ownerName: { type: String, trim: true },
        relationship: { type: String, trim: true },
        location: { type: String, trim: true },
        natureOfCultivation: { type: String, trim: true },
        extentOfLand: { type: String, trim: true },
        annualIncome: { type: Number, default: 0 }
      }
    ],

    // 08. Income derived from Houses / Rent
    houseIncome: [
      {
        ownerName: { type: String, trim: true },
        relationship: { type: String, trim: true },
        assessmentNo: { type: String, trim: true },
        chiefHolderNo: { type: String, trim: true },
        address: { type: String, trim: true },
        annualIncome: { type: Number, default: 0 },
        tenantDetails: { type: String, trim: true, default: '' }
      }
    ],

    houseLocation: {
      gnDivisionNo: { type: String, trim: true, default: '' },
      regionalSecretaryDivision: { type: String, trim: true, default: '' },
      localGovBodyName: { type: String, trim: true, default: '' }
    },

    // 09. Applicant Employment details (if employed)
    applicantEmployment: {
      isEmployed: { type: Boolean, default: false },
      institutionName: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
      post: { type: String, trim: true, default: '' },
      salaryScale: { type: String, trim: true, default: '' },
      salary: { type: Number, default: 0 },
      appointmentDate: { type: Date, default: null },
      hasResignationOrLeaveLetter: { type: Boolean, default: false }
    },

    // 10. Marriage Details (if married)
    marriageDetails: {
      isMarried: { type: Boolean, default: false },
      marriageDate: { type: Date, default: null },
      spouseName: { type: String, trim: true, default: '' },
      spouseIdNumber: { type: String, trim: true, default: '' },
      spouseInstitution: { type: String, trim: true, default: '' },
      spousePost: { type: String, trim: true, default: '' },
      spouseMonthlySalary: { type: Number, default: 0 }
    },

    // 12. Details of Parents / Guardians
    parentGuardianInfo: {
      father: {
        fullName: { type: String, trim: true, default: '' },
        livingStatus: { type: String, enum: ['LIVING', 'DECEASED', ''], default: 'LIVING' },
        ageYears: { type: Number, default: 0 },
        ageMonths: { type: Number, default: 0 },
        occupation: { type: String, trim: true, default: '' },
        employmentAddress: { type: String, trim: true, default: '' },
        annualEmploymentIncome: { type: Number, default: 0 },
        annualPropertyIncome: { type: Number, default: 0 },
        annualOtherIncome: { type: Number, default: 0 },
        totalAnnualIncome: { type: Number, default: 0 }
      },
      mother: {
        fullName: { type: String, trim: true, default: '' },
        livingStatus: { type: String, enum: ['LIVING', 'DECEASED', ''], default: 'LIVING' },
        ageYears: { type: Number, default: 0 },
        ageMonths: { type: Number, default: 0 },
        occupation: { type: String, trim: true, default: '' },
        employmentAddress: { type: String, trim: true, default: '' },
        annualEmploymentIncome: { type: Number, default: 0 },
        annualPropertyIncome: { type: Number, default: 0 },
        annualOtherIncome: { type: Number, default: 0 },
        totalAnnualIncome: { type: Number, default: 0 }
      },
      guardian: {
        hasGuardian: { type: Boolean, default: false },
        fullName: { type: String, trim: true, default: '' },
        address: { type: String, trim: true, default: '' },
        postHeld: { type: String, trim: true, default: '' },
        annualSalary: { type: Number, default: 0 },
        annualPropertyIncome: { type: Number, default: 0 },
        age: { type: Number, default: 0 }
      },
      totalParentsAnnualIncome: { type: Number, default: 0 },
      parentsSeparated: { type: Boolean, default: false },
      separationVerified: { type: Boolean, default: false }
    },

    // 15. Declaration by applicant
    declaration: {
      certifiedByApplicant: { type: Boolean, default: false },
      declarationDate: { type: Date, default: null },
      signatureConfirmed: { type: Boolean, default: false }
    },

    // 16. Preliminary Eligibility Evaluation (UGC Circular No. 04/2026)
    eligibilityEvaluation: {
      status: {
        type: String,
        enum: ['ELIGIBLE', 'NOT_ELIGIBLE', 'INCOMPLETE', 'REQUIRES_MANUAL_REVIEW', null],
        default: null
      },
      citizenshipVerified: { type: Boolean, default: false },
      registrationVerified: { type: Boolean, default: false },
      mahapolaStatusVerified: { type: Boolean, default: false },
      parentalAnnualIncome: { type: Number, default: 0 },
      studentAnnualEmploymentIncome: { type: Number, default: 0 },
      assessableAnnualIncome: { type: Number, default: 0 },
      basicIncomeCeiling: { type: Number, default: 500000 },
      schoolSiblingCount: { type: Number, default: 0 },
      schoolConcession: { type: Number, default: 0 },
      qualifyingUniversityChildCount: { type: Number, default: 0 },
      universityConcession: { type: Number, default: 0 },
      adjustedIncomeCeiling: { type: Number, default: 500000 },
      incomeConditionSatisfied: { type: Boolean, default: false },
      reasons: [{ type: String }],
      manualReviewReasons: [{ type: String }],
      evaluatedAt: { type: Date, default: null },
      circularReference: { type: String, default: 'UGC Circular No. 04/2026' },
      circularEffectiveDate: { type: Date, default: () => new Date('2026-01-01') }
    }
  },
  {
    timestamps: true,
    collection: 'bursary_applications'
  }
);

// Indexes
bursaryApplicationSchema.index({ studentId: 1, academicYear: 1 });
bursaryApplicationSchema.index({ status: 1 });

const BursaryApplication = mongoose.model('BursaryApplication', bursaryApplicationSchema);

module.exports = {
  BursaryApplication,
  APPLICATION_STATUS
};

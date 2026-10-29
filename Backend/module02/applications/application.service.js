// module 02
const { BursaryApplication, APPLICATION_STATUS } = require('./application.model');
const { ApplicationDocument } = require('../documents/document.model');
const Student = require('../../module1/students/student.model');
const SystemSetting = require('../../module1/system/system.model');
const { ROLES, normalizeRole } = require('../../config/constants');
const { validateFinalSubmission } = require('./application.validation');

class ApplicationService {
  /**
   * Helper to retrieve the current academic year
   */
  async getCurrentAcademicYear() {
    const setting = await SystemSetting.findOne({ settingKey: 'CURRENT_ACADEMIC_YEAR' });
    return setting ? setting.settingValue : String(new Date().getFullYear());
  }

  async getApplicationEditPeriodDays() {
  const setting = await SystemSetting.findOne({
    settingKey: 'APPLICATION_EDIT_PERIOD_DAYS'
  });

  const days = setting
    ? Number(setting.settingValue)
    : 14;

  if (!Number.isFinite(days) || days <= 0) {
    return 14;
  }

  return days;
  }

  async moveExpiredApplicationsToGSReview() {
  const now = new Date();

  const result = await BursaryApplication.updateMany(
    {
      status: APPLICATION_STATUS.SUBMITTED,
      editDeadline: {
        $ne: null,
        $lte: now
      }
    },
    {
      $set: {
        status: APPLICATION_STATUS.GS_REVIEW
      }
    }
  );

  return result.modifiedCount;
}


  /**
   * Helper to generate a unique sequential application number (BUR-YYYY-XXXXXX)
   */
  async generateApplicationNumber(academicYear) {
    const prefix = `BUR-${academicYear}-`;
    const latestApp = await BursaryApplication.findOne({
      applicationNo: new RegExp(`^${prefix}`)
    }).sort({ applicationNo: -1 });

    let nextNum = 1;
    if (latestApp && latestApp.applicationNo) {
      const parts = latestApp.applicationNo.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        nextNum = lastSeq + 1;
      }
    }
    return `${prefix}${String(nextNum).padStart(6, '0')}`;
  }

  /**
   * Create a new Bursary Application draft for the logged-in student
   */
  async createApplication(userId, body = {}) {
    const student = await Student.findOne({ userId }).populate({
      path: 'gnDivisionId',
      populate: { path: 'dsDivisionId' }
    });

    if (!student) {
      const error = new Error('Student profile not found. Please complete your student profile first.');
      error.statusCode = 404;
      throw error;
    }

    const currentYear = await this.getCurrentAcademicYear();

    // Check for existing active application in the current academic year
    const existing = await BursaryApplication.findOne({
      studentId: student._id,
      academicYear: currentYear
    });

    if (existing) {
      const error = new Error(
        `An application for academic year ${currentYear} already exists (${existing.applicationNo}) with status: ${existing.status}.`
      );
      error.statusCode = 400;
      throw error;
    }

    const applicationNo = await this.generateApplicationNumber(currentYear);

    // Prepopulate basic student personal info
    const gnDoc = student.gnDivisionId;
    const dsDoc = gnDoc && gnDoc.dsDivisionId ? gnDoc.dsDivisionId : null;

    const initialPersonal = {
      enrolmentNumber: student.registrationNo || '',
      fullName: student.fullName || '',
      nic: student.nic || '',
      mobileNumber: student.mobile || '',
      permanentAddress: student.address || '',
      district: student.district || '',
      selectedCourse: student.course || '',
      gnDivision: gnDoc ? gnDoc.divisionName : '',
      dsDivision: dsDoc ? dsDoc.divisionName : '',
      isSriLankanCitizen: student.nationality === 'Sri Lankan',
      bocAccountNumber: body.bocAccountNumber || '',
      gceAlIndexNo: body.gceAlIndexNo || '',
      title: body.title || '',
      alDistrict: body.alDistrict || student.district || '',
      distanceToUniversityKm: body.distanceToUniversityKm || 0,
      homeContactNumber: body.homeContactNumber || ''
    };

    const newApplication = await BursaryApplication.create({
      studentId: student._id,
      applicationNo,
      academicYear: currentYear,
      status: APPLICATION_STATUS.DRAFT,
      applicationDate: new Date(),
      editDeadline : null,
      gsDivisionId: gnDoc ? gnDoc._id : null,
      dsDivisionId: dsDoc ? dsDoc._id : null,
      personalInformation: initialPersonal,
      familyMembers: body.familyMembers || [],
      higherEdSiblings: body.higherEdSiblings || [],
      incomeTaxPayers: body.incomeTaxPayers || [],
      previousHigherEducation: body.previousHigherEducation || {},
      otherScholarships: body.otherScholarships || {},
      landIncome: body.landIncome || [],
      houseIncome: body.houseIncome || [],
      houseLocation: body.houseLocation || {},
      applicantEmployment: body.applicantEmployment || {},
      marriageDetails: body.marriageDetails || {},
      parentGuardianInfo: body.parentGuardianInfo || {},
      declaration: body.declaration || {}
    });

    return await BursaryApplication.findById(newApplication._id)
      .populate('studentId')
      .populate('gsDivisionId')
      .populate('dsDivisionId');
  }

  /**
   * Update an existing application draft / editable form
   */
  async updateApplication(userId, applicationId, updateData) {
    await this.moveExpiredApplicationsToGSReview();
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

    // Security check: Must belong to authenticated student
    if (application.studentId.toString() !== student._id.toString()) {
      const error = new Error('Unauthorized: You can only edit your own application');
      error.statusCode = 403;
      throw error;
    }

    // Editable status check
    const editableStatuses = [
    APPLICATION_STATUS.DRAFT,
    APPLICATION_STATUS.EDITING,
    APPLICATION_STATUS.SUBMITTED,
    APPLICATION_STATUS.CORRECTION_REQUIRED
    ];

    if (!editableStatuses.includes(application.status)) {
      const error = new Error(`Application cannot be modified while in '${application.status}' status`);
      error.statusCode = 400;
      throw error;
    }

    // Deadline check (enforced strictly by backend)
    if (
  application.editDeadline &&
  new Date() >= new Date(application.editDeadline) &&
  (
    application.status === APPLICATION_STATUS.SUBMITTED ||
    application.status === APPLICATION_STATUS.CORRECTION_REQUIRED
  )
) {
  const error = new Error(
    'Application editing period has ended. The application is no longer editable.'
  );
  error.statusCode = 400;
  throw error;
}

    // Merge sections
    const sections = [
      'personalInformation',
      'familyMembers',
      'higherEdSiblings',
      'incomeTaxPayers',
      'previousHigherEducation',
      'otherScholarships',
      'landIncome',
      'houseIncome',
      'houseLocation',
      'applicantEmployment',
      'marriageDetails',
      'parentGuardianInfo',
      'declaration',
      'gsDivisionId',
      'dsDivisionId'
    ];

    sections.forEach((sec) => {
      if (updateData[sec] !== undefined) {
        if (typeof updateData[sec] === 'object' && !Array.isArray(updateData[sec])) {
          application[sec] = { ...application[sec].toObject(), ...updateData[sec] };
        } else {
          application[sec] = updateData[sec];
        }
      }
    });

    // Auto-calculate parental total income if parent details are updated
    if (application.parentGuardianInfo) {
      const fInc = Number(application.parentGuardianInfo.father?.totalAnnualIncome) || 0;
      const mInc = Number(application.parentGuardianInfo.mother?.totalAnnualIncome) || 0;
      application.parentGuardianInfo.totalParentsAnnualIncome = fInc + mInc;
    }

    await application.save();

    return await BursaryApplication.findById(application._id)
      .populate('studentId')
      .populate('gsDivisionId')
      .populate('dsDivisionId');
  }

  /**
   * Submit application for bursary review
   */
  async submitApplication(userId, applicationId) {
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
      const error = new Error('Unauthorized: You can only submit your own application');
      error.statusCode = 403;
      throw error;
    }

    const submittableStatuses = [
      APPLICATION_STATUS.DRAFT,
      APPLICATION_STATUS.EDITING,
      APPLICATION_STATUS.CORRECTION_REQUIRED
    ];

    if (!submittableStatuses.includes(application.status)) {
      const error = new Error(`Application is already in '${application.status}' status and cannot be submitted.`);
      error.statusCode = 400;
      throw error;
    }

    // Backend deadline check
    if (application.editDeadline && new Date() > new Date(application.editDeadline)) {
      const error = new Error('Application submission deadline has passed.');
      error.statusCode = 400;
      throw error;
    }

    // Retrieve all attached documents
    const attachedDocuments = await ApplicationDocument.find({ applicationId: application._id });

    // Validate completeness of application and required documents
    const validation = validateFinalSubmission(application, attachedDocuments);
    if (!validation.isValid) {
      const error = new Error('Cannot submit application: Required details or documents are missing.');
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    const editPeriodDays = await this.getApplicationEditPeriodDays();

const submittedAt = new Date();

const editDeadline = new Date(submittedAt);
editDeadline.setDate(
  editDeadline.getDate() + editPeriodDays
);

application.status = APPLICATION_STATUS.SUBMITTED;
application.submittedAt = submittedAt;
application.editDeadline = editDeadline;

await application.save();

// Automatically route direct review link email to the assigned GS officer
let gsNotification = null;
try {
  const reviewEmailService = require('../../module03/reviews/review.email.service');
  const emailRes = await reviewEmailService.sendGsReviewLink(application._id);
  gsNotification = {
    recipientEmail: emailRes.recipientEmail,
    reviewLink: emailRes.reviewLink
  };
} catch (emailErr) {
  console.error('[Application Submission] Notice: Could not send GS review email link:', emailErr.message);
}

// Module 05: Dispatch confirmation email and in-app notification to the student applicant
try {
  const workflowService = require('../../module05/services/workflow.service');
  await workflowService.onApplicationSubmitted(application._id);
} catch (wfErr) {
  console.error('[Application Submission] Module 05 notice:', wfErr.message);
}

return {
  message: 'Bursary application submitted successfully',
  applicationNo: application.applicationNo,
  status: application.status,
  submittedAt: application.submittedAt,
  editDeadline: application.editDeadline,
  editPeriodDays,
  gsNotification
};
  }

  /**
   * Get student's current applications
   */
  async getMyApplications(userId) {
    const student = await Student.findOne({ userId });
    if (!student) {
      const error = new Error('Student profile not found');
      error.statusCode = 404;
      throw error;
    }

    const currentYear = await this.getCurrentAcademicYear();

    const applications = await BursaryApplication.find({
      studentId: student._id,
      academicYear: currentYear
    })
      .populate('gsDivisionId', 'divisionName officialEmail')
      .populate('dsDivisionId', 'divisionName officialEmail')
      .sort({ createdAt: -1 });

    return applications;
  }

  /**
   * Get student's past and present application history
   */
  async getApplicationHistory(userId) {
    const student = await Student.findOne({ userId });
    if (!student) {
      const error = new Error('Student profile not found');
      error.statusCode = 404;
      throw error;
    }

    const applications = await BursaryApplication.find({ studentId: student._id })
      .populate('gsDivisionId', 'divisionName')
      .populate('dsDivisionId', 'divisionName')
      .sort({ academicYear: -1, createdAt: -1 });

    return applications;
  }

  /**
   * View single application with authorization and attached documents
   */
  async getApplicationById(userId, userRole, applicationId) {
    const application = await BursaryApplication.findById(applicationId)
      .populate('studentId')
      .populate('gsDivisionId')
      .populate('dsDivisionId')
      .populate('previousApplicationId', 'applicationNo academicYear status');

    if (!application) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    const canonicalRole = normalizeRole(userRole);

    // Student can only view their own application
    if (canonicalRole === ROLES.STUDENT) {
      const student = await Student.findOne({ userId });
      if (!student || application.studentId._id.toString() !== student._id.toString()) {
        const error = new Error('Forbidden: You can only view your own application');
        error.statusCode = 403;
        throw error;
      }
    }

    // Attach documents
    const documents = await ApplicationDocument.find({ applicationId: application._id });

    return {
      application,
      documents
    };
  }

  /**
   * Re-apply for a new academic year
   */
  async reapplyApplication(userId, body = {}) {
    const student = await Student.findOne({ userId });
    if (!student) {
      const error = new Error('Student profile not found');
      error.statusCode = 404;
      throw error;
    }

    const currentYear = await this.getCurrentAcademicYear();

    // Check if student already has an active application in the current academic year
    const existingCurrent = await BursaryApplication.findOne({
      studentId: student._id,
      academicYear: currentYear
    });

    if (existingCurrent) {
      const error = new Error(
        `You already have an application (${existingCurrent.applicationNo}) for academic year ${currentYear}.`
      );
      error.statusCode = 400;
      throw error;
    }

    // Find previous application to clone persistent details
    let previousApp = null;
    if (body.previousApplicationId) {
      previousApp = await BursaryApplication.findById(body.previousApplicationId);
    } else {
      previousApp = await BursaryApplication.findOne({
        studentId: student._id,
        academicYear: { $ne: currentYear }
      }).sort({ academicYear: -1, createdAt: -1 });
    }

    if (!previousApp) {
      const error = new Error('No previous application found to re-apply from.');
      error.statusCode = 404;
      throw error;
    }

    // Generate new application number for the current year
    const newAppNo = await this.generateApplicationNumber(currentYear);

    // Clone allowed persistent information (personal info, family structure)
    const clonedApplication = await BursaryApplication.create({
      studentId: student._id,
      applicationNo: newAppNo,
      academicYear: currentYear,
      status: APPLICATION_STATUS.DRAFT,
      applicationDate: new Date(),
      editDeadline: null,
      previousApplicationId: previousApp._id,
      gsDivisionId: previousApp.gsDivisionId,
      dsDivisionId: previousApp.dsDivisionId,
      personalInformation: previousApp.personalInformation || {},
      familyMembers: previousApp.familyMembers || [],
      higherEdSiblings: previousApp.higherEdSiblings || [],
      houseLocation: previousApp.houseLocation || {},
      landIncome: previousApp.landIncome || [],
      houseIncome: previousApp.houseIncome || [],
      // Income and employment start fresh for re-evaluation
      parentGuardianInfo: {},
      applicantEmployment: {},
      marriageDetails: previousApp.marriageDetails || {},
      declaration: {}
    });

    return await BursaryApplication.findById(clonedApplication._id)
      .populate('studentId')
      .populate('gsDivisionId')
      .populate('dsDivisionId')
      .populate('previousApplicationId', 'applicationNo academicYear status');
  }
}

module.exports = new ApplicationService();

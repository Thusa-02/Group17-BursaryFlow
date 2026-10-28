// module 02
const { DOCUMENT_TYPES } = require('../documents/document.model');

const validateDraftUpdate = (data) => {
  const errors = [];

  if (data.personalInformation) {
    const p = data.personalInformation;
    if (p.distanceToUniversityKm !== undefined && (isNaN(p.distanceToUniversityKm) || p.distanceToUniversityKm < 0)) {
      errors.push('distanceToUniversityKm must be a non-negative number');
    }
  }

  if (data.parentGuardianInfo) {
    const pg = data.parentGuardianInfo;
    if (pg.father && pg.father.totalAnnualIncome !== undefined && isNaN(pg.father.totalAnnualIncome)) {
      errors.push("Father's totalAnnualIncome must be a valid number");
    }
    if (pg.mother && pg.mother.totalAnnualIncome !== undefined && isNaN(pg.mother.totalAnnualIncome)) {
      errors.push("Mother's totalAnnualIncome must be a valid number");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates full application requirements before submission
 */
const validateFinalSubmission = (application, attachedDocuments = []) => {
  const errors = [];
  const p = application.personalInformation || {};
  const pg = application.parentGuardianInfo || {};
  const f = pg.father || {};
  const m = pg.mother || {};
  const g = pg.guardian || {};
  const marriage = application.marriageDetails || {};
  const emp = application.applicantEmployment || {};
  const decl = application.declaration || {};

  // 1. Personal Information checks
  if (!p.bocAccountNumber || !p.bocAccountNumber.trim()) {
    errors.push('BOC Account Number is compulsory (Page 1)');
  }
  if (!p.gceAlIndexNo || !p.gceAlIndexNo.trim()) {
    errors.push('G.C.E. A/L Index Number is required');
  }
  if (!p.permanentAddress || !p.permanentAddress.trim()) {
    errors.push('Permanent address is required');
  }
  if (!p.mobileNumber || !p.mobileNumber.trim()) {
    errors.push('Mobile contact number is required');
  }
  if (p.distanceToUniversityKm === undefined || p.distanceToUniversityKm === null || p.distanceToUniversityKm < 0) {
    errors.push('Distance from residence to University (km) is required');
  }

  // 2. Declaration check
  if (!decl.certifiedByApplicant) {
    errors.push('Applicant declaration certification (Clause 15) must be acknowledged');
  }

  // Document types present
  const docTypes = attachedDocuments.map((d) => d.documentType);
  const hasDoc = (type) => docTypes.includes(type) || docTypes.includes(DOCUMENT_TYPES.OTHER);

  // 3. Parental / Guardian Document Verification
  // Father documents
  if (f.livingStatus === 'DECEASED') {
    if (!hasDoc(DOCUMENT_TYPES.DEATH_CERTIFICATE_FATHER)) {
      errors.push('Father is indicated as deceased: Death certificate must be uploaded');
    }
  } else if (f.livingStatus === 'LIVING') {
    if ((f.annualEmploymentIncome > 0 || f.occupation) && !hasDoc(DOCUMENT_TYPES.SALARY_CERTIFICATE_FATHER) && !hasDoc(DOCUMENT_TYPES.PENSION_CERTIFICATE)) {
      errors.push("Father is employed or receiving pension: Father's salary/pension certificate must be uploaded");
    }
  }

  // Mother documents
  if (m.livingStatus === 'DECEASED') {
    if (!hasDoc(DOCUMENT_TYPES.DEATH_CERTIFICATE_MOTHER)) {
      errors.push('Mother is indicated as deceased: Death certificate must be uploaded');
    }
  } else if (m.livingStatus === 'LIVING') {
    if ((m.annualEmploymentIncome > 0 || m.occupation) && !hasDoc(DOCUMENT_TYPES.SALARY_CERTIFICATE_MOTHER) && !hasDoc(DOCUMENT_TYPES.PENSION_CERTIFICATE)) {
      errors.push("Mother is employed or receiving pension: Mother's salary/pension certificate must be uploaded");
    }
  }

  // Guardian documents (if guardian is present)
  if (g.hasGuardian) {
    if (g.annualSalary > 0 && !hasDoc(DOCUMENT_TYPES.SALARY_CERTIFICATE_GUARDIAN)) {
      errors.push("Guardian is employed: Guardian's salary certificate must be uploaded");
    }
  }

  // Marriage documents
  if (marriage.isMarried) {
    if (!hasDoc(DOCUMENT_TYPES.MARRIAGE_CERTIFICATE)) {
      errors.push('Applicant is married: Marriage certificate must be uploaded');
    }
    if (marriage.spouseMonthlySalary > 0 && !hasDoc(DOCUMENT_TYPES.SALARY_CERTIFICATE_SPOUSE)) {
      errors.push('Spouse is employed: Spouse salary certificate must be uploaded');
    }
  }

  // Applicant employment documents
  if (emp.isEmployed) {
    if (!hasDoc(DOCUMENT_TYPES.APPLICANT_EMPLOYMENT_LEAVE_LETTER)) {
      errors.push('Applicant is employed: Study leave or resignation letter must be uploaded');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateDraftUpdate,
  validateFinalSubmission
};

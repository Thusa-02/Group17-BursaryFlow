const { normalizeRole, ROLES } = require('../../config/constants');

const validateDSDivision = (data) => {
  const errors = [];
  if (!data.divisionName || !data.divisionName.trim()) {
    errors.push('DS divisionName is required');
  }
  if (!data.officialEmail || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.officialEmail)) {
    errors.push('A valid officialEmail is required');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateGNDivision = (data) => {
  const errors = [];
  if (!data.dsDivisionId) {
    errors.push('dsDivisionId is required');
  }
  if (!data.divisionName || !data.divisionName.trim()) {
    errors.push('GN divisionName is required');
  }
  if (!data.officialEmail || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.officialEmail)) {
    errors.push('A valid officialEmail is required');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateOfficialStaff = (data) => {
  const errors = [];

  if (!data.username || data.username.trim().length < 3) {
    errors.push('Username is required (min 3 chars)');
  }
  if (!data.officialEmail || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.officialEmail)) {
    errors.push('A valid officialEmail is required');
  }
  if (!data.password || data.password.length < 6) {
    errors.push('Password is required (min 6 chars)');
  }
  if (!data.role) {
    errors.push('Staff role is required');
  } else {
    const canonical = normalizeRole(data.role);
    if (!Object.values(ROLES).includes(canonical)) {
      errors.push(`Invalid role. Valid roles are: ${Object.values(ROLES).join(', ')}`);
    }
  }

  // If role is GN officer, divisionType must be GN and divisionId must be provided
  const canonicalRole = normalizeRole(data.role);
  if (canonicalRole === ROLES.GN_OFFICER && !data.divisionId) {
    errors.push('divisionId (GN Division ID) is required for GN Officers');
  }
  if (canonicalRole === ROLES.DS_OFFICER && !data.divisionId) {
    errors.push('divisionId (DS Division ID) is required for DS Officers');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateDSDivision,
  validateGNDivision,
  validateOfficialStaff
};

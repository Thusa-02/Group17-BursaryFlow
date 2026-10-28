/**
 * BursaryFlow Constants - Roles, Permissions, and Alias Mappings
 * Aligned with the database schema specification.
 */

const ROLES = {
  STUDENT: 'STUDENT',
  GN_OFFICER: 'GN_OFFICER',
  DS_OFFICER: 'DS_OFFICER',
  COUNSELLOR: 'COUNSELLOR',
  WELFARE_OFFICER: 'WELFARE_OFFICER',
  BURSAR: 'BURSAR',
  REGISTRAR: 'REGISTRAR',
  ADMIN: 'ADMIN'
};

// Common aliases mapping to handle variations in requests and UI components
const ROLE_ALIASES = {
  GS: ROLES.GN_OFFICER,
  GN: ROLES.GN_OFFICER,
  GN_OFFICER: ROLES.GN_OFFICER,
  DS: ROLES.DS_OFFICER,
  DS_OFFICER: ROLES.DS_OFFICER,
  SENIOR_STUDENT_COUNSELLOR: ROLES.COUNSELLOR,
  COUNSELLOR: ROLES.COUNSELLOR,
  WELFARE: ROLES.WELFARE_OFFICER,
  WELFARE_OFFICER: ROLES.WELFARE_OFFICER,
  SYSTEM_ADMIN: ROLES.ADMIN,
  ADMIN: ROLES.ADMIN,
  STUDENT: ROLES.STUDENT,
  BURSAR: ROLES.BURSAR,
  REGISTRAR: ROLES.REGISTRAR
};

const PERMISSIONS = {
  SUBMIT_APPLICATION: 'SUBMIT_APPLICATION',
  VIEW_APPLICATION: 'VIEW_APPLICATION',
  GN_REVIEW: 'GN_REVIEW',
  DS_REVIEW: 'DS_REVIEW',
  COMMITTEE_REVIEW: 'COMMITTEE_REVIEW',
  APPROVE_APPLICATION: 'APPROVE_APPLICATION',
  MANAGE_STUDENTS: 'MANAGE_STUDENTS',
  MANAGE_DIVISIONS: 'MANAGE_DIVISIONS',
  MANAGE_USERS: 'MANAGE_USERS'
};

/**
 * Normalizes any role input string or alias to the canonical database role name.
 * @param {string} role 
 * @returns {string} canonical role name
 */
const normalizeRole = (role) => {
  if (!role) return '';
  const upper = String(role).trim().toUpperCase();
  return ROLE_ALIASES[upper] || upper;
};

module.exports = {
  ROLES,
  ROLE_ALIASES,
  PERMISSIONS,
  normalizeRole
};

const { normalizeRole, ROLES } = require('../../config/constants');

const validateCreateUser = (data) => {
  const errors = [];

  if (!data.username || typeof data.username !== 'string' || data.username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (!data.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.push('A valid email address is required');
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!data.role) {
    errors.push('Role is required');
  } else {
    const canonical = normalizeRole(data.role);
    if (!Object.values(ROLES).includes(canonical)) {
      errors.push(`Invalid role. Valid roles are: ${Object.values(ROLES).join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateUpdateUser = (data) => {
  const errors = [];

  if (data.username && (typeof data.username !== 'string' || data.username.trim().length < 3)) {
    errors.push('Username must be at least 3 characters long');
  }

  if (data.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.push('A valid email address is required');
  }

  if (data.role) {
    const canonical = normalizeRole(data.role);
    if (!Object.values(ROLES).includes(canonical)) {
      errors.push(`Invalid role. Valid roles are: ${Object.values(ROLES).join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateCreateUser,
  validateUpdateUser
};

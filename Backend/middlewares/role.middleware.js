const { normalizeRole, ROLES } = require('../config/constants');
const Role = require('../module1/roles/role.model');
const { RolePermission } = require('../module1/permissions/permission.model');

/**
 * Role-Based Authorization Middleware
 * Usage: authorizeRoles("STUDENT") or authorizeRoles("ADMIN", "GS", "DS")
 * Handles role aliases automatically (e.g. GS -> GN_OFFICER, SYSTEM_ADMIN -> ADMIN).
 */
const authorizeRoles = (...roles) => {
  // Normalize all provided role criteria
  const allowedRoles = roles.map(r => normalizeRole(r));

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required.'
      });
    }

    const userRole = normalizeRole(req.user.role);

    // ADMIN has superuser privileges across all routes
    if (userRole === ROLES.ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied. Required role: [${roles.join(', ')}]. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Permission-Based Authorization Middleware
 * Usage: authorizePermissions("MANAGE_USERS")
 */
const authorizePermissions = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User authentication required.'
        });
      }

      const userRole = normalizeRole(req.user.role);

      // System Admin bypasses permission checks
      if (userRole === ROLES.ADMIN) {
        return next();
      }

      // Find role object
      const roleDoc = await Role.findOne({ roleName: userRole });
      if (!roleDoc) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: User role not defined in system.'
        });
      }

      // Find role permissions
      const rolePerms = await RolePermission.find({ roleId: roleDoc._id }).populate('permissionId');
      const assignedPermNames = rolePerms
        .map(rp => rp.permissionId ? rp.permissionId.permissionName : null)
        .filter(Boolean);

      const hasAllRequired = requiredPermissions.every(perm => assignedPermNames.includes(perm));

      if (!hasAllRequired) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Missing required permission: [${requiredPermissions.join(', ')}]`
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorizeRoles,
  authorizePermissions
};

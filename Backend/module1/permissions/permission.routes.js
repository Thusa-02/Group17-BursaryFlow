const express = require('express');
const router = express.Router();
const permissionController = require('./permission.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

// All permission routes require authentication and ADMIN role
router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router
  .route('/')
  .get(permissionController.getAllPermissions)
  .post(permissionController.createPermission);

router
  .route('/:id')
  .get(permissionController.getPermissionById)
  .delete(permissionController.deletePermission);

// Role-Permission assignment endpoints
router
  .route('/role/:roleId')
  .get(permissionController.getRolePermissions)
  .post(permissionController.assignPermissionToRole);

router
  .route('/role/:roleId/:permissionId')
  .delete(permissionController.removePermissionFromRole);

module.exports = router;

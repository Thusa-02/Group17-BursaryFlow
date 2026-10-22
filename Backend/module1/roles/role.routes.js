const express = require('express');
const router = express.Router();
const roleController = require('./role.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

// All role routes require authentication
router.use(authenticate);

router
  .route('/')
  .get(authorizeRoles(ROLES.ADMIN, ROLES.REGISTRAR, ROLES.WELFARE_OFFICER), roleController.getAllRoles)
  .post(authorizeRoles(ROLES.ADMIN), roleController.createRole);

router
  .route('/:id')
  .get(authorizeRoles(ROLES.ADMIN, ROLES.REGISTRAR), roleController.getRoleById)
  .put(authorizeRoles(ROLES.ADMIN), roleController.updateRole)
  .delete(authorizeRoles(ROLES.ADMIN), roleController.deleteRole);

module.exports = router;

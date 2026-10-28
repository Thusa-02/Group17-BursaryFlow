const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

// User management is strictly protected for ADMIN / SYSTEM_ADMIN
router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router
  .route('/')
  .get(userController.getAllUsers)
router
  .route('/:id')
  .get(userController.getUserById)
  .put(userController.updateUser);

router
  .route('/:id/status')
  .patch(userController.updateUserStatus);

module.exports = router;

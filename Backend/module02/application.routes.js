// module 02
const express = require('express');
const router = express.Router();
const applicationController = require('./application.controller');
const documentRoutes = require('../documents/document.routes');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

// All application routes require authentication
router.use(authenticate);

// Nested document routes (/api/applications/:id/documents)
router.use('/:id/documents', documentRoutes);

// Specific named student routes (must be placed before parameterized /:id route)
router
  .route('/')
  .post(authorizeRoles(ROLES.STUDENT), applicationController.createApplication);

router
  .route('/my')
  .get(authorizeRoles(ROLES.STUDENT), applicationController.getMyApplications);

router
  .route('/history')
  .get(authorizeRoles(ROLES.STUDENT), applicationController.getApplicationHistory);

router
  .route('/reapply')
  .post(authorizeRoles(ROLES.STUDENT), applicationController.reapplyApplication);

// Parameterized application routes
router
  .route('/:id')
  .get(applicationController.getApplicationById)
  .put(authorizeRoles(ROLES.STUDENT), applicationController.updateApplication);

router
  .route('/:id/submit')
  .post(authorizeRoles(ROLES.STUDENT), applicationController.submitApplication);

module.exports = router;

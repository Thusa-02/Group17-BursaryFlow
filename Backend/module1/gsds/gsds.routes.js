const express = require('express');
const router = express.Router();
const gsDsController = require('./gsds.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

// All GSDS routes require authentication
router.use(authenticate);

// ===================== DS DIVISION ROUTES =====================
router
  .route('/ds')
  .get(gsDsController.getAllDSDivisions)
  .post(authorizeRoles(ROLES.ADMIN), gsDsController.createDSDivision);

router
  .route('/ds/:id')
  .get(gsDsController.getDSDivisionById)
  .put(authorizeRoles(ROLES.ADMIN), gsDsController.updateDSDivision)
  .delete(authorizeRoles(ROLES.ADMIN), gsDsController.deleteDSDivision);

// ===================== GN DIVISION ROUTES =====================
router
  .route('/gn')
  .get(gsDsController.getAllGNDivisions)
  .post(authorizeRoles(ROLES.ADMIN), gsDsController.createGNDivision);

router
  .route('/gn/:id')
  .get(gsDsController.getGNDivisionById)
  .put(authorizeRoles(ROLES.ADMIN), gsDsController.updateGNDivision)
  .delete(authorizeRoles(ROLES.ADMIN), gsDsController.deleteGNDivision);

// ===================== OFFICIAL STAFF ROUTES =====================
router
  .route('/staff')
  .get(
    authorizeRoles(ROLES.ADMIN, ROLES.REGISTRAR, ROLES.WELFARE_OFFICER),
    gsDsController.getAllStaff
  )
  .post(authorizeRoles(ROLES.ADMIN), gsDsController.createStaff);

router
  .route('/staff/:id')
  .get(
    authorizeRoles(ROLES.ADMIN, ROLES.REGISTRAR, ROLES.WELFARE_OFFICER),
    gsDsController.getStaffById
  )
  .put(authorizeRoles(ROLES.ADMIN), gsDsController.updateStaff)
  .delete(authorizeRoles(ROLES.ADMIN), gsDsController.deleteStaff);

module.exports = router;

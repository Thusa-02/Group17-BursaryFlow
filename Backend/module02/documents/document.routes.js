// module 02
const express = require('express');
const router = express.Router({ mergeParams: true });
const documentController = require('./document.controller');
const upload = require('./document.upload');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

// Document routes require authentication
router.use(authenticate);

router
  .route('/')
  .post(
    authorizeRoles(ROLES.STUDENT),
    upload.single('file'),
    documentController.uploadDocument
  )
  .get(documentController.getApplicationDocuments);

router
  .route('/:documentId/download')
  .get(documentController.downloadDocument);

router
  .route('/:documentId')
  .delete(authorizeRoles(ROLES.STUDENT), documentController.deleteDocument);

module.exports = router;

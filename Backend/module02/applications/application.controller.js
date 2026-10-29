// module 02
const applicationService = require('./application.service');
const { validateDraftUpdate } = require('./application.validation');

const createApplication = async (req, res, next) => {
  try {
    const application = await applicationService.createApplication(req.user.userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Bursary application draft created successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getMyApplications(req.user.userId);
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationHistory = async (req, res, next) => {
  try {
    const applications = await applicationService.getApplicationHistory(req.user.userId);
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const result = await applicationService.getApplicationById(
      req.user.userId,
      req.user.role,
      req.params.id
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    const validation = validateDraftUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const updated = await applicationService.updateApplication(
      req.user.userId,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const submitApplication = async (req, res, next) => {
  try {
    const result = await applicationService.submitApplication(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const reapplyApplication = async (req, res, next) => {
  try {
    const application = await applicationService.reapplyApplication(req.user.userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Re-application draft created successfully for new academic year',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationHistory,
  getApplicationById,
  updateApplication,
  submitApplication,
  reapplyApplication
};

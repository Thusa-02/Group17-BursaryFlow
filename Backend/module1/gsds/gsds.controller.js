const gsDsService = require('./gsds.service');
const {
  validateDSDivision,
  validateGNDivision,
  validateOfficialStaff
} = require('./gsds.validation');

// ===================== DS DIVISION CONTROLLERS =====================
const getAllDSDivisions = async (req, res, next) => {
  try {
    const divisions = await gsDsService.getAllDSDivisions(req.query);
    res.status(200).json({
      success: true,
      count: divisions.length,
      data: divisions
    });
  } catch (error) {
    next(error);
  }
};

const getDSDivisionById = async (req, res, next) => {
  try {
    const division = await gsDsService.getDSDivisionById(req.params.id);
    res.status(200).json({
      success: true,
      data: division
    });
  } catch (error) {
    next(error);
  }
};

const createDSDivision = async (req, res, next) => {
  try {
    const validation = validateDSDivision(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const created = await gsDsService.createDSDivision(req.body);
    res.status(201).json({
      success: true,
      message: 'DS Division created successfully',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

const updateDSDivision = async (req, res, next) => {
  try {
    const updated = await gsDsService.updateDSDivision(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'DS Division updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteDSDivision = async (req, res, next) => {
  try {
    const result = await gsDsService.deleteDSDivision(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// ===================== GN DIVISION CONTROLLERS =====================
const getAllGNDivisions = async (req, res, next) => {
  try {
    const divisions = await gsDsService.getAllGNDivisions(req.query);
    res.status(200).json({
      success: true,
      count: divisions.length,
      data: divisions
    });
  } catch (error) {
    next(error);
  }
};

const getGNDivisionById = async (req, res, next) => {
  try {
    const division = await gsDsService.getGNDivisionById(req.params.id);
    res.status(200).json({
      success: true,
      data: division
    });
  } catch (error) {
    next(error);
  }
};

const createGNDivision = async (req, res, next) => {
  try {
    const validation = validateGNDivision(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const created = await gsDsService.createGNDivision(req.body);
    res.status(201).json({
      success: true,
      message: 'GN Division created successfully',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

const updateGNDivision = async (req, res, next) => {
  try {
    const updated = await gsDsService.updateGNDivision(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'GN Division updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteGNDivision = async (req, res, next) => {
  try {
    const result = await gsDsService.deleteGNDivision(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// ===================== OFFICIAL STAFF CONTROLLERS =====================
const getAllStaff = async (req, res, next) => {
  try {
    const staff = await gsDsService.getAllStaff(req.query);
    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

const getStaffById = async (req, res, next) => {
  try {
    const staff = await gsDsService.getStaffById(req.params.id);
    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const validation = validateOfficialStaff(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const created = await gsDsService.createStaff(req.body);
    res.status(201).json({
      success: true,
      message: 'Official staff account created successfully',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

const updateStaff = async (req, res, next) => {
  try {
    const updated = await gsDsService.updateStaff(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Staff record updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    const result = await gsDsService.deleteStaff(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDSDivisions,
  getDSDivisionById,
  createDSDivision,
  updateDSDivision,
  deleteDSDivision,
  getAllGNDivisions,
  getGNDivisionById,
  createGNDivision,
  updateGNDivision,
  deleteGNDivision,
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};

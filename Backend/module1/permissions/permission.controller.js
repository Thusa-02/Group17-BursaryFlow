const permissionService = require('./permission.service');

const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await permissionService.getAllPermissions();
    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    next(error);
  }
};

const getPermissionById = async (req, res, next) => {
  try {
    const permission = await permissionService.getPermissionById(req.params.id);
    res.status(200).json({
      success: true,
      data: permission
    });
  } catch (error) {
    next(error);
  }
};

const createPermission = async (req, res, next) => {
  try {
    const { permissionName, description } = req.body;
    if (!permissionName) {
      return res.status(400).json({
        success: false,
        message: 'permissionName is required'
      });
    }
    const newPerm = await permissionService.createPermission({ permissionName, description });
    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: newPerm
    });
  } catch (error) {
    next(error);
  }
};

const deletePermission = async (req, res, next) => {
  try {
    const result = await permissionService.deletePermission(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

const getRolePermissions = async (req, res, next) => {
  try {
    const data = await permissionService.getRolePermissions(req.params.roleId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const assignPermissionToRole = async (req, res, next) => {
  try {
    const { permissionId } = req.body;
    if (!permissionId) {
      return res.status(400).json({
        success: false,
        message: 'permissionId is required in request body'
      });
    }
    const mapping = await permissionService.assignPermissionToRole(req.params.roleId, permissionId);
    res.status(201).json({
      success: true,
      message: 'Permission assigned to role successfully',
      data: mapping
    });
  } catch (error) {
    next(error);
  }
};

const removePermissionFromRole = async (req, res, next) => {
  try {
    const result = await permissionService.removePermissionFromRole(
      req.params.roleId,
      req.params.permissionId
    );
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPermissions,
  getPermissionById,
  createPermission,
  deletePermission,
  getRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole
};

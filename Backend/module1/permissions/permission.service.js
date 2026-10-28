const { Permission, RolePermission } = require('./permission.model');
const Role = require('../roles/role.model');

class PermissionService {
  async getAllPermissions() {
    return await Permission.find().sort({ permissionName: 1 });
  }

  async getPermissionById(id) {
    const permission = await Permission.findById(id);
    if (!permission) {
      const error = new Error('Permission not found');
      error.statusCode = 404;
      throw error;
    }
    return permission;
  }

  async createPermission(data) {
    const permissionName = data.permissionName.toUpperCase().trim();
    const existing = await Permission.findOne({ permissionName });
    if (existing) {
      const error = new Error(`Permission '${permissionName}' already exists`);
      error.statusCode = 400;
      throw error;
    }
    return await Permission.create({
      permissionName,
      description: data.description || ''
    });
  }

  async deletePermission(id) {
    const permission = await this.getPermissionById(id);
    // Remove all role mappings for this permission
    await RolePermission.deleteMany({ permissionId: id });
    await permission.deleteOne();
    return { message: 'Permission deleted successfully', permissionId: id };
  }

  async getRolePermissions(roleId) {
    const role = await Role.findById(roleId);
    if (!role) {
      const error = new Error('Role not found');
      error.statusCode = 404;
      throw error;
    }
    const mappings = await RolePermission.find({ roleId }).populate('permissionId');
    return {
      role,
      permissions: mappings.map(m => m.permissionId).filter(Boolean)
    };
  }

  async assignPermissionToRole(roleId, permissionId) {
    // Validate role and permission exist
    const role = await Role.findById(roleId);
    if (!role) {
      const error = new Error('Role not found');
      error.statusCode = 404;
      throw error;
    }
    const perm = await Permission.findById(permissionId);
    if (!perm) {
      const error = new Error('Permission not found');
      error.statusCode = 404;
      throw error;
    }

    const existing = await RolePermission.findOne({ roleId, permissionId });
    if (existing) {
      const error = new Error('Permission is already assigned to this role');
      error.statusCode = 400;
      throw error;
    }

    const mapping = await RolePermission.create({ roleId, permissionId });
    return mapping;
  }

  async removePermissionFromRole(roleId, permissionId) {
    const deleted = await RolePermission.findOneAndDelete({ roleId, permissionId });
    if (!deleted) {
      const error = new Error('Permission assignment not found for this role');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Permission removed from role successfully' };
  }
}

module.exports = new PermissionService();

const Role = require('./role.model');
const { ROLES } = require('../../config/constants');
const { RolePermission } = require('../permissions/permission.model');


class RoleService {
  async getAllRoles() {
    return await Role.find().sort({ roleName: 1 });
  }

  async getRoleById(id) {
    const role = await Role.findById(id);
    if (!role) {
      const error = new Error('Role not found');
      error.statusCode = 404;
      throw error;
    }
    return role;
  }

  async createRole(data) {
    const roleName = data.roleName.toUpperCase().trim();
    const existing = await Role.findOne({ roleName });
    if (existing) {
      const error = new Error(`Role '${roleName}' already exists`);
      error.statusCode = 400;
      throw error;
    }
    return await Role.create({
      roleName,
      description: data.description || ''
    });
  }

  async updateRole(id, data) {
    const role = await this.getRoleById(id);
    if (data.roleName) {
      role.roleName = data.roleName.toUpperCase().trim();
    }
    if (data.description !== undefined) {
      role.description = data.description;
    }
    return await role.save();
  }

  async deleteRole(id) {
  const role = await this.getRoleById(id);

  const protectedRoles = [
    ROLES.STUDENT,
    ROLES.ADMIN,
    ROLES.GN_OFFICER,
    ROLES.DS_OFFICER,
    ROLES.BURSAR,
    ROLES.REGISTRAR,
    ROLES.COUNSELLOR,
    ROLES.WELFARE_OFFICER
  ];

  if (protectedRoles.includes(role.roleName)) {
    const error = new Error(
      `The system role '${role.roleName}' cannot be deleted.`
    );
    error.statusCode = 403;
    throw error;
  }

  // Remove role-permission mappings
  await RolePermission.deleteMany({ roleId: id });

  // Delete the role
  await role.deleteOne();

  return {
    message: 'Role deleted successfully',
    roleId: id
  };
}
}

module.exports = new RoleService();

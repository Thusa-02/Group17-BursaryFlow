const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    permissionName: {
      type: String,
      required: [true, 'Permission name is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'permissions'
  }
);

const rolePermissionSchema = new mongoose.Schema(
  {
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role ID is required']
    },
    permissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
      required: [true, 'Permission ID is required']
    }
  },
  {
    timestamps: true,
    collection: 'role_permissions'
  }
);

// Prevent duplicate role-permission pairs
rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

const Permission = mongoose.model('Permission', permissionSchema);
const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);

module.exports = {
  Permission,
  RolePermission
};

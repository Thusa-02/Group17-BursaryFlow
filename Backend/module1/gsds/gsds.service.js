const { DSDivision, GNDivision, OfficialStaff } = require('./gsds.model');
const User = require('../users/user.model');
const { normalizeRole, ROLES } = require('../../config/constants');

class GsDsService {
  // ===================== DS DIVISION METHODS =====================
  async getAllDSDivisions(query = {}) {
    const filter = {};
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true' || query.isActive === true;
    }
    return await DSDivision.find(filter).sort({ divisionName: 1 });
  }

  async getDSDivisionById(id) {
    const ds = await DSDivision.findById(id);
    if (!ds) {
      const error = new Error('DS Division not found');
      error.statusCode = 404;
      throw error;
    }
    return ds;
  }

  async createDSDivision(data) {
    return await DSDivision.create({
      divisionName: data.divisionName.trim(),
      officialEmail: data.officialEmail.toLowerCase().trim(),
      phoneNumber: data.phoneNumber || '',
      address: data.address || '',
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  }

  async updateDSDivision(id, data) {
    const ds = await this.getDSDivisionById(id);
    Object.assign(ds, data);
    return await ds.save();
  }

  async deleteDSDivision(id) {
    const ds = await this.getDSDivisionById(id);
    // Check if child GN divisions exist
    const childCount = await GNDivision.countDocuments({ dsDivisionId: id });
    if (childCount > 0) {
      const error = new Error(`Cannot delete DS Division: ${childCount} GN Division(s) are linked to it.`);
      error.statusCode = 400;
      throw error;
    }
    await ds.deleteOne();
    return { message: 'DS Division deleted successfully' };
  }

  // ===================== GN DIVISION METHODS =====================
  async getAllGNDivisions(query = {}) {
    const filter = {};
    if (query.dsDivisionId) {
      filter.dsDivisionId = query.dsDivisionId;
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true' || query.isActive === true;
    }
    return await GNDivision.find(filter)
      .populate('dsDivisionId', 'divisionName officialEmail phoneNumber')
      .sort({ divisionName: 1 });
  }

  async getGNDivisionById(id) {
    const gn = await GNDivision.findById(id).populate('dsDivisionId');
    if (!gn) {
      const error = new Error('GN Division not found');
      error.statusCode = 404;
      throw error;
    }
    return gn;
  }

  async createGNDivision(data) {
    // Validate DS Division exists
    const ds = await DSDivision.findById(data.dsDivisionId);
    if (!ds) {
      const error = new Error('Referenced DS Division does not exist');
      error.statusCode = 400;
      throw error;
    }

    return await GNDivision.create({
      dsDivisionId: data.dsDivisionId,
      divisionName: data.divisionName.trim(),
      officialEmail: data.officialEmail.toLowerCase().trim(),
      phoneNumber: data.phoneNumber || '',
      address: data.address || '',
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  }

  async updateGNDivision(id, data) {
    const gn = await this.getGNDivisionById(id);
    if (data.dsDivisionId) {
      const ds = await DSDivision.findById(data.dsDivisionId);
      if (!ds) {
        const error = new Error('Referenced DS Division does not exist');
        error.statusCode = 400;
        throw error;
      }
    }
    Object.assign(gn, data);
    return await gn.save();
  }

  async deleteGNDivision(id) {
    const gn = await this.getGNDivisionById(id);
    await gn.deleteOne();
    return { message: 'GN Division deleted successfully' };
  }

  // ===================== OFFICIAL STAFF METHODS =====================
  async getAllStaff(query = {}) {
    const filter = {};
    if (query.role) {
      filter.role = normalizeRole(query.role);
    }
    if (query.divisionType) {
      filter.divisionType = query.divisionType;
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true' || query.isActive === true;
    }

    return await OfficialStaff.find(filter)
      .populate('userId', 'username email role isActive createdAt')
      .populate('divisionId')
      .sort({ createdAt: -1 });
  }

  async getStaffById(id) {
    const staff = await OfficialStaff.findById(id)
      .populate('userId', 'username email role isActive')
      .populate('divisionId');

    if (!staff) {
      const error = new Error('Staff record not found');
      error.statusCode = 404;
      throw error;
    }
    return staff;
  }

  async createStaff(data) {
  const username = data.username.toLowerCase().trim();
  const email = data.officialEmail.toLowerCase().trim();
  const canonicalRole = normalizeRole(data.role);

  // Official staff endpoint must NEVER create student accounts.
if (canonicalRole === ROLES.STUDENT) {
  const error = new Error(
    'Student accounts must be created through student self-registration.'
  );
  error.statusCode = 403;
  throw error;
}

// Only official staff roles are allowed here.
const staffRoles = [
  ROLES.GN_OFFICER,
  ROLES.DS_OFFICER,
  ROLES.COUNSELLOR,
  ROLES.WELFARE_OFFICER,
  ROLES.BURSAR,
  ROLES.REGISTRAR
];

if (!staffRoles.includes(canonicalRole)) {
  const error = new Error(
    'Invalid staff role. Only official staff roles can be created here.'
  );
  error.statusCode = 400;
  throw error;
}

  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    const error = new Error(
      'User with this username or email already exists'
    );
    error.statusCode = 400;
    throw error;
  }

  let divisionType;
  let divisionRef = null;

  // Determine division based on role

  if (canonicalRole === ROLES.GN_OFFICER) {
    divisionType = 'GN';
    divisionRef = 'GNDivision';

    const gnDivision = await GNDivision.findById(data.divisionId);

    if (!gnDivision) {
      const error = new Error(
        'Selected GN Division does not exist'
      );
      error.statusCode = 400;
      throw error;
    }

    if (!gnDivision.isActive) {
      const error = new Error(
        'Selected GN Division is inactive'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  else if (canonicalRole === ROLES.DS_OFFICER) {
    divisionType = 'DS';
    divisionRef = 'DSDivision';

    const dsDivision = await DSDivision.findById(data.divisionId);

    if (!dsDivision) {
      const error = new Error(
        'Selected DS Division does not exist'
      );
      error.statusCode = 400;
      throw error;
    }

    if (!dsDivision.isActive) {
      const error = new Error(
        'Selected DS Division is inactive'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  else {
    // University-level staff
    divisionType = 'UNIVERSITY';
    divisionRef = null;
  }

  // Hash password

  const passwordHash = await User.hashPassword(
    data.password || 'Staff@123'
  );

  // Create User

  const user = await User.create({
    username,
    email,
    passwordHash,
    role: canonicalRole,
    isActive:
      data.isActive !== undefined
        ? data.isActive
        : true
  });

  // Create Official Staff

  let staff;

  try {
    staff = await OfficialStaff.create({
      userId: user._id,
      role: canonicalRole,
      officialEmail: email,
      divisionType,
      divisionId:
        canonicalRole === ROLES.GN_OFFICER ||
        canonicalRole === ROLES.DS_OFFICER
          ? data.divisionId
          : null,
      divisionRef,
      contactNo: data.contactNo || '',
      isActive:
        data.isActive !== undefined
          ? data.isActive
          : true
    });
  } catch (error) {
    // Remove User if OfficialStaff creation fails
    await User.findByIdAndDelete(user._id);
    throw error;
  }

  return await OfficialStaff.findById(staff._id)
    .populate(
      'userId',
      'username email role isActive'
    )
    .populate('divisionId');
}

  async updateStaff(id, data) {
    const staff = await this.getStaffById(id);

    if (data.officialEmail) staff.officialEmail = data.officialEmail.toLowerCase().trim();
    if (data.contactNo !== undefined) staff.contactNo = data.contactNo;
    if (data.divisionId !== undefined) staff.divisionId = data.divisionId;
    if (data.divisionType !== undefined) staff.divisionType = data.divisionType;
    if (data.isActive !== undefined) staff.isActive = Boolean(data.isActive);

    await staff.save();

    // If email or status changed, sync with user account
    if (data.officialEmail || data.isActive !== undefined) {
      await User.findByIdAndUpdate(staff.userId, {
        ...(data.officialEmail && { email: staff.officialEmail }),
        ...(data.isActive !== undefined && { isActive: staff.isActive })
      });
    }

    return await OfficialStaff.findById(staff._id)
      .populate('userId', 'username email role isActive')
      .populate('divisionId');
  }

  async deleteStaff(id) {
    const staff = await this.getStaffById(id);
    await User.findByIdAndDelete(staff.userId);
    await staff.deleteOne();
    return { message: 'Staff member and linked user account deleted successfully' };
  }
}

module.exports = new GsDsService();

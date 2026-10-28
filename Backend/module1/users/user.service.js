const User = require('./user.model');
const Student = require('../students/student.model');
const { OfficialStaff } = require('../gsds/gsds.model');
const { normalizeRole, ROLES } = require('../../config/constants');

class UserService {
  async getAllUsers(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.role) {
      filter.role = normalizeRole(query.role);
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true' || query.isActive === true;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ username: searchRegex }, { email: searchRegex }];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      users
    };
  }

  async getUserById(id) {
    const user = await User.findById(id).select('-passwordHash');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async createUser(data) {
    const username = data.username.toLowerCase().trim();
    const email = data.email.toLowerCase().trim();
    const role = normalizeRole(data.role || ROLES.STUDENT);

    // Check duplicate
    const existing = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existing) {
      const error = new Error(
        existing.username === username
          ? 'Username is already taken'
          : 'Email is already registered'
      );
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await User.hashPassword(data.password);

    const newUser = await User.create({
      username,
      email,
      passwordHash,
      role,
      isActive: data.isActive !== undefined ? data.isActive : true
    });

    const userObj = newUser.toObject();
    delete userObj.passwordHash;
    return userObj;
  }

  async updateUser(id, data) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.username) {
      const newUsername = data.username.toLowerCase().trim();
      if (newUsername !== user.username) {
        const exists = await User.findOne({ username: newUsername });
        if (exists) {
          const error = new Error('Username is already taken');
          error.statusCode = 400;
          throw error;
        }
        user.username = newUsername;
      }
    }

    if (data.email) {
      const newEmail = data.email.toLowerCase().trim();
      if (newEmail !== user.email) {
        const exists = await User.findOne({ email: newEmail });
        if (exists) {
          const error = new Error('Email is already registered');
          error.statusCode = 400;
          throw error;
        }
        user.email = newEmail;
      }
    }

    if (data.role) {
      user.role = normalizeRole(data.role);
    }

    if (data.isActive !== undefined) {
      user.isActive = Boolean(data.isActive);
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.passwordHash;
    return userObj;
  }

  async updateUserStatus(id, isActive) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    user.isActive = Boolean(isActive);
    await user.save();

    return {
      userId: user._id,
      username: user.username,
      isActive: user.isActive,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`
    };
  }
}

module.exports = new UserService();

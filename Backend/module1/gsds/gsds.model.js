const mongoose = require('mongoose');

// DS Divisions Schema
const dsDivisionSchema = new mongoose.Schema(
  {
    divisionName: {
      type: String,
      required: [true, 'DS Division name is required'],
      trim: true
    },
    officialEmail: {
      type: String,
      required: [true, 'Official email is required'],
      trim: true,
      lowercase: true
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'ds_divisions'
  }
);

// GN Divisions Schema
const gnDivisionSchema = new mongoose.Schema(
  {
    dsDivisionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DSDivision',
      required: [true, 'DS Division ID is required']
    },
    divisionName: {
      type: String,
      required: [true, 'GN Division name is required'],
      trim: true
    },
    officialEmail: {
      type: String,
      required: [true, 'Official email is required'],
      trim: true,
      lowercase: true
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'gn_divisions'
  }
);

// Official Staff Schema (for GS, DS, Welfare Officer, Counsellor, Bursar, Registrar, etc.)
const officialStaffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true
    },
    role: {
      type: String,
      required: [true, 'Staff role is required'],
      trim: true
    },
    officialEmail: {
      type: String,
      required: [true, 'Official email is required'],
      trim: true,
      lowercase: true
    },
    divisionType: {
      type: String,
      enum: ['GN', 'GS', 'DS', 'UNIVERSITY', null],
      default: null
    },
    divisionId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'divisionRef',
      default: null
    },
    divisionRef: {
      type: String,
      enum: ['GNDivision', 'GSDivision', 'DSDivision', null],
      default: null
    },
    contactNo: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'official_staff'
  }
);

const DSDivision = mongoose.model('DSDivision', dsDivisionSchema);
const GNDivision = mongoose.model('GNDivision', gnDivisionSchema);
const OfficialStaff = mongoose.model('OfficialStaff', officialStaffSchema);

module.exports = {
  DSDivision,
  GNDivision,
  OfficialStaff
};

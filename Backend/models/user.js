import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["citizen", "public-official", "admin"],
      default: "citizen",
    },
    locationString: {
      type: String,
      default: ""
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    department: {
      type: String,
      default: ""
    },
    position: {
      type: String,
      default: ""
    },
    profilePicture: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add index for geospatial queries
userSchema.index({ location: '2dsphere' });

export default mongoose.model("User", userSchema);
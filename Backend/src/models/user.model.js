import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const skillProficientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Other",
    },
    status: {
      type: String,
      enum: ["Claimed", "Verified", "Verified + Portfolio"],
      default: "Claimed",
    },
    assessmentScore: {
      type: Number,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    githubEvidence: {
      repoUrl: { type: String, default: "" },
      repoName: { type: String, default: "" },
      score: { type: Number, default: 0 },
      detectedTech: [{ type: String }],
      evidenceItems: [{ type: String }],
      analyzedAt: { type: Date, default: null },
    },
  },
  { _id: true }
);

const skillToLearnSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Other",
    },
  },
  { _id: true }
);

const userSchema = new Schema(
  {
    // =========================
    // REQUIRED REGISTRATION FIELDS
    // =========================

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

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
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    // =========================
    // PROFILE INFORMATION
    // =========================

    picture: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    },

    // Optional
    bio: {
      type: String,
      default: "",
      trim: true,
    },

    // Optional
    location: {
      type: String,
      default: "",
      trim: true,
    },

    // Required during registration
    experienceLevel: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
    },

    // Required during registration
    availability: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // APPLICATION MANAGED FIELDS
    // =========================

    rating: {
      type: Number,
      default: 0.0,
    },

    numRatings: {
      type: Number,
      default: 0,
    },

    completedSessions: {
      type: Number,
      default: 0,
    },

    connectionsCount: {
      type: Number,
      default: 0,
    },

    // =========================
    // OPTIONAL SOCIAL LINKS
    // =========================

    linkedinLink: {
      type: String,
      default: "",
      trim: true,
    },

    githubLink: {
      type: String,
      default: "",
      trim: true,
    },

    portfolioLink: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // SKILLS
    // =========================

    skillsProficientAt: [skillProficientSchema],

    skillsToLearn: [skillToLearnSchema],

    // =========================
    // EDITABLE FROM PROFILE PAGE
    // =========================

    education: [
      {
        institution: {
          type: String,
          default: "",
        },
        degree: {
          type: String,
          default: "",
        },
        startDate: {
          type: Date,
          default: null,
        },
        endDate: {
          type: Date,
          default: null,
        },
        score: {
          type: Number,
          default: 0,
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],

    projects: [
      {
        title: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        projectLink: {
          type: String,
          default: "",
        },
        techStack: [
          {
            type: String,
            default: "",
          },
        ],
        startDate: {
          type: Date,
          default: null,
        },
        endDate: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

// =========================
// PASSWORD HASHING
// =========================

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// =========================
// PASSWORD CHECK
// =========================

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
var uniqueValidator = require("mongoose-unique-validator");
const arrayUniquePlugin = require("mongoose-unique-array");
const autoIncrement = require("@ed3ath/mongoose-auto-increment");

autoIncrement.initialize(mongoose.connection);

const chefsSchema = new mongoose.Schema(
  {
    chefAid: { type: Number, required: true, trim: true, unique: true },
    name: { type: String, required: true },
    // birthDate: { type: Date, required: true },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // minLength: 5,
    },
    email: {
      type: String,
      // default: "0@0.com",
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email!"],
    },
    emailVerified: { type: Boolean, default: false },
    image: { type: String, trim: true, default: "" },
    password: {
      type: String,
      required: true,
      trim: true,
      // minLength: 5,
    },
    messageToken: { type: String, default: "", trim: true },
    passwordChangeAt: {
      type: Date,
      default: Date.now(),
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

chefsSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.passwordChangeAt;
  delete userObject.tokens;

  return userObject;
};

chefsSchema.methods.generateAuthToken = async function () {
  const user = this;
  console.log(user._id + " asdasdasdasdasdsad");
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

chefsSchema.statics.findByCredentials = async (email, password) => {
  const user = await Chefs.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new Error("بيانات تسجيل الدخول غير صحيحة");
  }
  if (user.password !== password) {
    throw new Error("بيانات تسجيل الدخول غير صحيحة");
  }
  return user;
};

chefsSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.passwordChangeAt = Date.now();
  }
  next();
});

chefsSchema.plugin(uniqueValidator, { data: "Must be unique" });
chefsSchema.plugin(arrayUniquePlugin);
chefsSchema.plugin(autoIncrement.plugin, { model: "Chefs", field: "chefAid" });
const Chefs = mongoose.model("Chefs", chefsSchema, "Chefs");

module.exports = Chefs;

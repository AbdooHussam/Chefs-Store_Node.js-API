const mongoose = require("mongoose");
const Recipes = require("../models/recipes_model");
const validator = require("validator");
var uniqueValidator = require("mongoose-unique-validator");
const arrayUniquePlugin = require("mongoose-unique-array");
const autoIncrement = require("@ed3ath/mongoose-auto-increment");

autoIncrement.initialize(mongoose.connection);

const ordersSchema = new mongoose.Schema(
  {
    orderAid: { type: Number, required: true, trim: true, unique: true },
    recipeAid: {
      type: Number,
      required: true,
      trim: true,
      ref: "Recipes",
      // refPath: "userAid",
    },
    chefAid: {
      type: Number,
      required: true,
      trim: true,
      ref: "Chefs",
      // refPath: "userAid",
    },
    userAid: {
      type: Number,
      required: true,
      trim: true,
      ref: "Users",
      // refPath: "userAid",
    },
    price: { type: Number, required: true, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
    //  toJSON: { virtuals: true },
    //  toObject: { virtuals: true },
  }
);

ordersSchema.pre("save", async function (next) {
  if (this.isNew) {
    const recipe = await Recipes.findOne({ recipeAid: this.recipeAid });
    if (!recipe) {
      throw new Error("الوصفة غير موجودة");
    } else {
      this.price = recipe.price;
    }
  }
  next();
});

//  change unique Error ( {PATH} {VALUE} {TYPE} )
ordersSchema.plugin(uniqueValidator, { data: "Must be unique" });
ordersSchema.plugin(arrayUniquePlugin);
ordersSchema.plugin(autoIncrement.plugin, {
  model: "Orders",
  field: "orderAid",
});

const Orders = mongoose.model("Orders", ordersSchema, "Orders");

module.exports = Orders;

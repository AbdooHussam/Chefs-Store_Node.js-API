const mongoose = require("mongoose");
const validator = require("validator");
var uniqueValidator = require("mongoose-unique-validator");
const arrayUniquePlugin = require("mongoose-unique-array");
const autoIncrement = require("@ed3ath/mongoose-auto-increment");

autoIncrement.initialize(mongoose.connection);

const recipesSchema = new mongoose.Schema(
  {
    recipeAid: { type: Number, required: true, trim: true, unique: true },
    chefAid: {
      type: Number,
      required: true,
      trim: true,
      ref: "Chefs",
      // refPath: "userAid",
    },
    price: { type: Number, required: true, trim: true },
    title: { type: String, default: "" },
    ingredients: { type: String, default: "" },
    instructions: { type: String, default: "" },
    image: { type: String, trim: true, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
    //  toJSON: { virtuals: true },
    //  toObject: { virtuals: true },
  }
);

//  change unique Error ( {PATH} {VALUE} {TYPE} )
recipesSchema.plugin(uniqueValidator, { data: "Must be unique" });
recipesSchema.plugin(arrayUniquePlugin);
recipesSchema.plugin(autoIncrement.plugin, {
  model: "Recipes",
  field: "recipeAid",
});

const Recipes = mongoose.model("Recipes", recipesSchema, "Recipes");

module.exports = Recipes;

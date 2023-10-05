const express = require("express");
const cloudinary = require("../cloudinary/cloudinary");
const upload = require("../middleware/multer");
const { ObjectId, Double } = require("mongodb");
const Recipes = require("../models/recipes_model");
const Chefs = require("../models/chefs_model");
const router = new express.Router();

router.post("/newRecipe", upload.single("image"), async (req, res) => {
  try {
    const chef = await Chefs.findOne({ chefAid: req.body.chefAid });

    if (!chef) {
      return res.status(404).send({ error: true, data: "not found" });
    }
    console.log(req.file);
    if (req.file && req.file.path && req.file.path != "") {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "Chefs-Recipe-Store/Recipes",
      });
      console.log(result.secure_url);
      const recipe = new Recipes(req.body);
      recipe.image = result.secure_url;
      await recipe.save();
      return res.send({ error: false, data: recipe });
    } else {
      const recipe = new Recipes(req.body);
      recipe.image = "";
      await recipe.save();
      return res.send({ error: false, data: recipe });
    }

    console.log("/pooost recipe");
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: true, data: e.message });
  }
});

router.get("/recipes", async (req, res) => {
  try {
    const recipeAid = req.query.recipeAid;
    const recipe = recipeAid
      ? await Recipes.findOne({ recipeAid })
      : await Recipes.find({});
    //.sort({ recipeAid: 1 });
    // if (recipe.length == 0) {
    //   return res
    //     .status(400)
    //     .send({ error: true, data: "لا يوجد غرف مسجلة بعد" });
    // }
    res.send({ error: false, data: recipe });
    console.log("/get all recipes");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.get("/recipes/:recipeAid", async (req, res) => {
  try {
    const recipeAid = req.params.recipeAid;
    const recipe = await Recipes.findById(recipeAid);
    if (!recipe) {
      return res.status(404).send({ error: true, data: "Not Found" });
    } else {
      res.send({ error: false, data: recipe });
    }

    console.log("/get recipes By Id");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.patch("/recipes/:recipeAid", async (req, res) => {
  try {
    const _id = req.params.recipeAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const body = req.body;
    const updates = Object.keys(body);
    const allowedUpdates = ["price", "title", "ingredients", "instructions"];
    const isValidOperation = updates.every((e) => allowedUpdates.includes(e));
    if (!isValidOperation) {
      return res.status(400).send({
        error: true,
        data: `Invalid updates! (the body shold have: [${allowedUpdates}] Only)`,
      });
    }
    // if use middlware
    const recipe = await Recipes.findOne({
      $or: [{ recipeAid: _id }, { _id: objId }],
    });
    if (!recipe) {
      res.status(404).send({ error: true, data: "No recipe Found" });
    } else {
      updates.forEach((e) => (recipe[e] = body[e]));
      await recipe.save();
      res.send({ error: false, data: recipe });
    }
    console.log("/Updaaaate recipe By Id2");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.delete("/recipes/:recipeAid", async (req, res) => {
  try {
    const _id = req.params.recipeAid;
    const recipe = await Recipes.findByIdAndDelete(_id);
    if (!recipe) {
      res.status(404).send({ error: true, data: "Not Found" });
    } else {
      res.send({ error: false, data: recipe });
    }
    console.log("/Deleeete recipe By Id");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.get("/myRecipes/:chefAid", async (req, res) => {
  try {
    const chefAid = req.params.chefAid;
    const recipe = await Recipes.find({ chefAid }).sort({ createdAt: -1 });
    if (!recipe) {
      return res.status(404).send({ error: true, data: "Not Found" });
    } else {
      res.send({ error: false, data: recipe });
    }

    console.log("/get recipes By chef Id");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

module.exports = router;

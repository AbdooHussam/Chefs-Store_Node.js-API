const express = require("express");
const { ObjectId, Double } = require("mongodb");
const Carts = require("../models/carts_model");
const Chefs = require("../models/chefs_model");
const Users = require("../models/users_model");
const {
  authMiddlewareChef,
  authMiddlewareUser,
} = require("../middleware/auth");
const router = new express.Router();

router.post("/carts", async (req, res) => {
  try {
    console.log(req.body);
    const cart = new Carts(req.body);

    await cart.save();
    res.send({ error: false, data: cart });

    console.log("/pooost cart");
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: true, data: e.message });
  }
});

router.get("/carts", async (req, res) => {
  try {
    const cartAid = req.query.cartAid;
    const cart = cartAid
      ? await Carts.findOne({ cartAid: cartAid })
      : await Carts.find({});

    res.send({ error: false, data: cart });
    console.log("/get all carts");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.patch("/carts/:cartAid", async (req, res) => {
  try {
    const _id = req.params.cartAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const body = req.body;
    const updates = Object.keys(body);
    const allowedUpdates = ["price", "quantity"];
    const isValidOperation = updates.every((e) => allowedUpdates.includes(e));
    if (!isValidOperation) {
      return res.status(400).send({
        error: true,
        data: `Invalid updates! (the body shold have: [${allowedUpdates}] Only)`,
      });
    }
    // if use middlware
    const cart = await Carts.findOne({
      $or: [{ cartAid: _id }, { _id: objId }],
    });
    if (!cart) {
      res.status(404).send({ error: true, data: "No cart Found" });
    } else {
      updates.forEach((e) => (cart[e] = body[e]));
      await cart.save();
      res.send({ error: false, data: cart });
    }
    console.log("/Updaaaate cart By Id2");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.delete("/carts/:cartAid", async (req, res) => {
  try {
    const cartAid = req.params.cartAid;
    const cart = await Carts.findOneAndDelete({ cartAid: cartAid });
    if (!cart) {
      res.status(404).send({ error: true, data: "Not Found" });
    } else {
      res.send({ error: false, data: cart });
    }
    console.log("/Deleeete cart By Id");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.get("/chefOrders", authMiddlewareChef, async (req, res) => {
  try {
    const chefAid = req.chef.chefAid;
    const cart = await Carts.find({ chefAid });
    res.send({ error: false, data: cart });
    console.log("/get all chefOrders");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.get("/userCarts", authMiddlewareUser, async (req, res) => {
  try {
    const userAid = req.user.userAid;
    const cart = await Carts.find({ userAid });
    res.send({ error: false, data: cart });
    console.log("/get all userOrders");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

module.exports = router;

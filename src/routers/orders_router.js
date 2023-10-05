const express = require("express");
const { ObjectId, Double } = require("mongodb");
const Orders = require("../models/orders_model");
const Chefs = require("../models/chefs_model");
const Users = require("../models/users_model");
const {
  authMiddlewareChef,
  authMiddlewareUser,
} = require("../middleware/auth");
const router = new express.Router();

router.post("/orders", async (req, res) => {
  try {
    console.log(req.body);
    const order = new Orders(req.body);

    await order.save();
    res.send({ error: false, data: order });

    console.log("/pooost order");
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: true, data: e.message });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const orderAid = req.query.orderAid;
    const order = orderAid
      ? await Orders.findOne({ orderAid })
      : await Orders.find({});

    res.send({ error: false, data: order });
    console.log("/get all orders");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.patch("/orders/:orderAid", async (req, res) => {
  try {
    const _id = req.params.orderAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const body = req.body;
    const updates = Object.keys(body);
    const allowedUpdates = ["price"];
    const isValidOperation = updates.every((e) => allowedUpdates.includes(e));
    if (!isValidOperation) {
      return res.status(400).send({
        error: true,
        data: `Invalid updates! (the body shold have: [${allowedUpdates}] Only)`,
      });
    }
    // if use middlware
    const order = await Orders.findOne({
      $or: [{ orderAid: _id }, { _id: objId }],
    });
    if (!order) {
      res.status(404).send({ error: true, data: "No order Found" });
    } else {
      updates.forEach((e) => (order[e] = body[e]));
      await order.save();
      res.send({ error: false, data: order });
    }
    console.log("/Updaaaate order By Id2");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.delete("/orders/:orderAid", async (req, res) => {
  try {
    const orderAid = req.params.orderAid;
    const order = await Orders.findOneAndDelete({ orderAid });
    if (!order) {
      res.status(404).send({ error: true, data: "Not Found" });
    } else {
      res.send({ error: false, data: order });
    }
    console.log("/Deleeete order By Id");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.get("/chefOrders", authMiddlewareChef, async (req, res) => {
  try {
    const chefAid = req.chef.chefAid;
    const order = await Orders.find({ chefAid });
    res.send({ error: false, data: order });
    console.log("/get all chefOrders");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.get("/userOrders", authMiddlewareUser, async (req, res) => {
  try {
    const userAid = req.user.userAid;
    const order = await Orders.find({ userAid });
    res.send({ error: false, data: order });
    console.log("/get all userOrders");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

module.exports = router;

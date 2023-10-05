const express = require("express");
const { ObjectId, Double } = require("mongodb");
const Chefs = require("../models/chefs_model");
const Users = require("../models/users_model");
const router = new express.Router();
const emailController = require("../emails/email-nodemailer");
var admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const Notifications = require("../models/notification_model");

router.post("/chef", async (req, res) => {
  try {
    console.log(req.body);
    const user = await Users.findOne({ email: req.body.email });
    const user2 = await Users.findOne({ phoneNumber: req.body.phoneNumber });
    if (user || user2) {
      return res
        .status(400)
        .send({ error: true, data: "هذا الحساب مسجل من قبل" });
    }
    const chef = new Chefs(req.body);
    await chef.save();
    const token = await chef.generateAuthToken();
    const emailOtp = emailController.generateRandomOTP(4);
    await emailController.nodeMailerSend(
      chef.email,
      "رمز تحقق TOWN JO",
      `رمز تحققك هو: ${emailOtp}`
    );
    let messageToken = req.body.messageToken;
    if (req.body.messageToken) {
      chef.messageToken = messageToken;
      await chef.save();

      admin.messaging().subscribeToTopic(messageToken, "all");
      const existingNotification = await Notifications.findOne({
        chefAid: chef.chefAid,
      });

      if (!existingNotification) {
        const newNotification = new Notifications({
          messageToken: chef.messageToken,
          chefAid: chef.chefAid,
        });
        await newNotification.save();
        const message = {
          token: chef.messageToken,
          notification: {
            title: "Welcome!",
            body: `مرحبا بك ${chef.name}`,
          },
        };
        getMessaging().send(message);
      }
    }
    res.send({ error: false, data: chef, token, emailOtp });
    console.log("/pooost chef");
  } catch (e) {
    console.error(e);
    let message = e.message;
    let emailVerified;
    if (message.toString().includes("Must be unique")) {
      message = "المستخدم مسجل من قبل";
      const chef = await Chefs.findOne({ email: req.body.email });
      emailVerified = chef.emailVerified;
    }
    res.status(400).send({ error: true, data: message, emailVerified });
  }
});

router.post("/chefLogin", async (req, res) => {
  try {
    const chef = await Chefs.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await chef.generateAuthToken();
    let messageToken = req.body.messageToken;
    if (req.body.messageToken) {
      chef.messageToken = messageToken;
      await chef.save();

      admin.messaging().subscribeToTopic(messageToken, "ALL");
      const existingNotification = await Notifications.findOne({
        chefAid: chef.chefAid,
      });

      if (!existingNotification) {
        const newNotification = new Notifications({
          messageToken: chef.messageToken,
          chefAid: chef.chefAid,
        });
        await newNotification.save();
        const message = {
          token: chef.messageToken,
          notification: {
            title: "Welcome!",
            body: `مرحبا بك ${chef.name}`,
          },
        };
        getMessaging().send(message);
      }
    }
    res.send({ error: false, data: chef, token, messageToken });
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: true, data: e.message });
  }
});

router.get("/chef", async (req, res) => {
  try {
    let chef;
    let param = req.query;
    if (param) {
      chef = await Chefs.find(param);
    } else {
      chef = await Chefs.find({});
    }

    res.send({ error: false, data: chef });

    console.log("/get all chef");
  } catch (e) {
    console.error({ error: true, data: e.message });
    res.status(400).send({ error: true, data: e.message });
  }
});

router.patch("/chef/:chefAid", async (req, res) => {
  try {
    const _id = req.params.chefAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const body = req.body;
    const updates = Object.keys(body);
    const allowedUpdates = [
      "name",
      "phoneNumber",
      "email",
      "emailVerified",
      "region",
      "password",
    ];
    const isValidOperation = updates.every((e) => allowedUpdates.includes(e));
    if (!isValidOperation) {
      return res.status(400).send({
        error: true,
        data: `Invalid updates! (the body shold have: [${allowedUpdates}] Only)`,
      });
    }
    // if use middlware
    const chef = await Chefs.findOne({
      $or: [{ chefAid: _id }, { _id: objId }],
    });
    if (!chef) {
      res.status(404).send({ error: true, data: "No chef Found" });
    } else {
      updates.forEach((e) => (chef[e] = body[e]));
      await chef.save();
      res.send({ error: false, data: chef });
    }
    console.log("/Updaaaate region By Id2");
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: true, data: e.message });
  }
});

router.get("/chef/:chefAid", async (req, res) => {
  try {
    const _id = req.params.chefAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const chef = await Chefs.findOne({
      $or: [{ chefAid: _id }, { _id: objId }],
    });

    res.send({ error: false, data: chef });
    console.log("/chef");
  } catch (e) {
    console.error({ error: true, data: e.message });
    res.status(400).send({ error: true, data: e.message });
  }
});

router.get("/chefSendMail/:chefAid", async (req, res) => {
  try {
    const _id = req.params.chefAid;
    var objId = new ObjectId(_id.length < 12 ? "123456789012" : _id);
    const chef = await Chefs.findOne({
      $or: [{ chefAid: _id }, { _id: objId }],
    });

    const emailOtp = emailController.generateRandomOTP(4);
    await emailController.nodeMailerSend(
      chef.email,
      "رمز تحقق TOWN JO",
      `رمز تحققك هو: ${emailOtp}`
    );
    res.send({ error: false, data: chef, emailOtp });
    console.log("/chefSendMail");
  } catch (e) {
    console.error({ error: true, data: e.message });
    res.status(400).send({ error: true, data: e.message });
  }
});

/////////////////////////// Teeeest //////////////////////////

module.exports = router;

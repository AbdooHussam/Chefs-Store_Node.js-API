const jwt = require("jsonwebtoken");
const Users = require("../models/users_model");
const Chefs = require("../models/chefs_model");

const authMiddlewareUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).send({ error: true, data: "Please authenticate." });
  }
};

const authMiddlewareChef = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const chef = await Chefs.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!chef) {
      throw new Error();
    }
    req.token = token;
    req.chef = chef;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).send({ error: true, data: "Please authenticate." });
  }
};

module.exports = {
  authMiddlewareUser,
  authMiddlewareChef,
};

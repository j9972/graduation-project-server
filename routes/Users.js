const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");

const { Users } = require("../models");

const { sign } = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10).then((hash) => {
    Users.create({
      username,
      password: hash,
    });
    res.json("success");
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await Users.findOne({ where: { username } });

  if (!user) {
    res.json({ error: "User doesnt exist" });
  }

  bcrypt.compare(password, user.password).then((match) => {
    if (!match) {
      res.json({ error: "wrong username and password combination" });
    }
    const accessToken = sign(
      { username: user.username, id: user.id },
      "importantSecretForSecurity"
    );

    res.json({ token: accessToken, username, id: user.id });
  });
});

router.get("/user", (req, res) => {
  res.json(req.user);
});

module.exports = router;

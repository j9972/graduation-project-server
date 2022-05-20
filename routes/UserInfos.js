require("dotenv").config();

const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");

const { Users } = require("../models");
const { validateToken } = require("../middleware/AuthMiddleware");

router.post("/findId", async (req, res) => {
  const email = req.body.email;
  console.log("email:", email);

  // validate if username already exists
  const user = await Users.findOne({ where: { email } });

  if (!user) {
    return res.status(200).json({
      errors: [
        {
          msg: "User doesnt exist",
        },
      ],
    });
  }

  res.json({
    username: user.username,
    msg: "success",
  });
});

router.post("/findPassword", async (req, res) => {
  const { username, email } = req.body;

  // validate if username already exists
  const user = await Users.findOne({ where: { username } });

  // 유저 아이디로 찾는데 유저 아이디가 틀린경우
  if (user == null) {
    return res.status(200).json({
      errors: [
        {
          msg: "A UserName Is Wrong ",
        },
      ],
    });
  }

  // 이메일이 틀린경우
  if (user.email !== email) {
    return res.status(200).json({
      errors: [
        {
          msg: "A Email Is Wrong",
        },
      ],
    });
  }

  // 전부 맞는경우
  if (user.username == username && user.email == email) {
    res.json({ msg: "success" });
  }
});

router.put("/change-password", async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await Users.findOne({ where: { email } });

  // 유저 이메일로 찾는데 유저 이메일이 틀린경우
  if (user == null) {
    return res.status(200).json({
      errors: [
        {
          msg: "A Email Is Wrong ",
        },
      ],
    });
  }

  if (user.email == email) {
    bcrypt.hash(newPassword, 10).then((hash) => {
      Users.update({ password: hash }, { where: { email } });
      res.json("success");
    });
  }
});

router.put("/change-username", async (req, res) => {
  const { email, newUsername } = req.body;

  const user = await Users.findOne({ where: { email } });

  // 유저 이메일로 찾는데 유저 이메일이 틀린경우
  if (user == null) {
    return res.status(200).json({
      errors: [
        {
          msg: "A Email Is Wrong ",
        },
      ],
    });
  }

  if (user.email == email) {
    Users.update({ username: newUsername }, { where: { email } });
    res.json("success");
  }
});

router.delete("/remove-user/:username", validateToken, async (req, res) => {
  try {
    const { username } = req.params;
    console.log("username", username);

    await Users.destroy({
      where: {
        username,
      },
    });

    res.json("DELETE SUCCESS");
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;

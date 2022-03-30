const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");

const { Users } = require("../models");

const { sign } = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
require("dotenv").config();
const nodemailer = require("nodemailer");

//Router -> username을 id로 생각
router.post("/", [check("email").isEmail()], async (req, res) => {
  const { email, username, password } = req.body;

  //validate user input
  const errors = validationResult(req);

  // 에러가 있으면 배열 형식으로 보기위함
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  // validate if user already exists
  const user = await Users.findOne({ where: { username } });

  if (user) {
    return res.status(200).json({
      errors: [
        {
          email: user.email,
          msg: "The User Account Already Exists ",
        },
      ],
    });
  }

  bcrypt.hash(password, 10).then((hash) => {
    Users.create({
      email,
      username,
      password: hash,
    });
  });

  const accessToken = sign(
    { email: Users.email, username: Users.username, id: Users.id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "10m",
    }
  );

  res.json({
    accessToken,
    msg: "success",
  });
});

router.post("/email-auth", async (req, res) => {
  const { email } = req.body;

  // 보안코드 랜덤 생성
  const generateRandom = (min, max) => {
    let ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return ranNum;
  };

  const SecurityCode = generateRandom(111111, 999999);
  console.log("SecurityCode:", SecurityCode);
  // 노드 메일 보내는 email
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = await transporter.sendMail({
    from: process.env.NODE_MAILER_USER,
    to: email,
    subject: "보안코드 입니다",
    text: "오른쪽 숫자 6자리를 입력해주세요" + SecurityCode,
  });
  console.log("mailOptions:", mailOptions);
  // 메일이 보내진 후의 콜백 함수
  transporter.sendMail(mailOptions, (err) => {
    if (err) res.send(err);
    else
      res
        .status(200)
        .json({ isMailSucssessed: true, SecurityCode: SecurityCode });
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await Users.findOne({ where: { username } });

  // manager가 있다면 accesToken이 있나?
  if (!user) {
    res.json({ error: "User doesnt exist" });
  }

  bcrypt.compare(password, user.password).then((match) => {
    if (!match) {
      res.json({ error: "wrong username and password combination" });
    }
    const accessToken = sign(
      { username: user.username, id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "10m",
      }
    );

    const refreshToken = sign(
      { username: user.username, id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "24d",
      }
    );

    Users.update(
      {
        refreshTokens: refreshToken,
      },
      {
        where: {
          username,
        },
      }
    );

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      username,
      id: user.id,
      email: user.email,
      msg: "success login",
    });
  });
});

// Create new access token from refresh token
// token 정리 => 회원가입시 access 줌 => 로그인시 access & refresh , refresh 없으면 로그인통해줌, access 없으면 token 포인트에서줌
router.post("/token", async (req, res) => {
  const refreshToken = req.header("x-auth-token");
  const { username, password } = req.body;
  console.log("refreshToken:", refreshToken);
  //const { id } = req.body;
  //const id = req.params.id;

  // If token is not provided, send error message
  if (!refreshToken) {
    res.status(401).json({
      errors: [
        {
          msg: "refreshToken not found",
        },
      ],
    });
  }

  // If token does not exist, send error message
  const user = await Users.findOne({
    where: {
      username: username,
    },
  });

  //res.json(manager.refreshTokens);

  // If token does not exist, send error message
  if (!user) {
    res.json({ error: "user Account doesnt exist" });
  }

  if (!user.refreshTokens) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid refresh token",
        },
      ],
    });
  }
  // const user = sign(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  // res.send(user);

  try {
    bcrypt.compare(password, user.password).then((match) => {
      if (!match) {
        res.send({ error: "wrong password or username" });
      }
      const user = sign(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      // user = { email: 'jame@gmail.com', iat: 1633586290, exp: 1633586350 }
      const { username } = user;
      const accessToken = sign(
        { username: { username } },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );
      res.json({ accessToken, refreshToken });
    });
  } catch (error) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid token",
        },
      ],
    });
  }
});

router.get("/user-id/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const user = await Users.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  res.json(user);
});

module.exports = router;

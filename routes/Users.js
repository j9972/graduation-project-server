require("dotenv").config();

const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { check, validationResult } = require("express-validator");

const { Users, Schedule, MyPageDBs } = require("../models");

//Redis
const redis = require("redis");
const client = redis.createClient();
const DEFAULT_EXPIRATION = 3600; // 3600s = 1hr

client.connect();

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
  const userEmail = await Users.findOne({ where: { email } });

  if (user) {
    return res.status(200).json({
      errors: [
        {
          email: user.username,
          msg: "The Username Already Exists ",
        },
      ],
    });
  }

  if (userEmail) {
    return res.status(200).json({
      errors: [
        {
          msg: "The User Email Already Exists ",
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

  // ACCESSTOKEN을 주는 이유는,,,?
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

router.post("/nameCheck", async (req, res) => {
  const username = req.body.username;

  // validate if username already exists
  const user = await Users.findOne({ where: { username } });

  if (user) {
    return res.status(200).json({
      errors: [
        {
          msg: "A UserName Already Exists ",
        },
      ],
    });
  }

  res.json({
    msg: "success",
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await Users.findOne({ where: { username } });

  // manager가 있다면 accesToken이 있나?
  if (!user) {
    res.json({ error: "User doesnt exist" });
    console.log("아이디가 없습니다 재로그인 부탁드려요");
  } else {
    bcrypt.compare(password, user.password).then((match) => {
      if (!match) {
        return res
          .status(200)
          .send({ error: "wrong username and password combination" });
        //res.json({ error: "wrong username and password combination" });
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
  }
});

// Create new access token from refresh token
// token 정리 => 회원가입시 access 줌 => 로그인시 access & refresh , refresh 없으면 로그인통해줌, access 없으면 token 포인트에서줌
router.post("/token", async (req, res) => {
  // 여기가 refresh가 맞는가 체크
  const refreshToken = req.header("x-auth-token");
  const { username, password } = req.body;

  // If token is not provided, send error message  (refresh 토큰이 없으니 재로근이 요함)
  if (!refreshToken) {
    return res.status(401).json({
      errors: [
        {
          msg: "refreshToken not found. Do Login",
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

  // If token does not exist, send error message
  if (!user) {
    return res.json({ error: "user Account doesnt exist" });
  }

  // token 유효성 검사 -> 유효하지 않음
  if (!user.refreshTokens) {
    return res.status(403).json({
      errors: [
        {
          msg: "Invalid refresh token. Do Login",
        },
      ],
    });
  }

  // 이 부분이 access를 refresh 기반으로 재발급 하는 부분임
  try {
    bcrypt.compare(password, user.password).then((match) => {
      if (!match) {
        return res.send({ error: "wrong password or username" });
      }
      const user = sign(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      // user = { email: 'jame@gmail.com', iat: 1633586290, exp: 1633586350 }
      const { username } = user;
      // 및의 함수가 accesToken의 유효성 검사 하는 부분
      const accessToken = sign(
        { username: { username } },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );
      // 어떤 refresh를 통해 받은 access인지 확인 가능
      res.json({ accessToken, refreshToken });
    });
  } catch (error) {
    return res.status(403).json({
      errors: [
        {
          msg: "Invalid token",
        },
      ],
    });
  }
});

router.get("/basicInfo/:username", async (req, res) => {
  try {
    // id는 그냥 로그인 했을떄 나오는 userId쓰기
    const { username } = req.params;

    const cachedUser = await client.get(`basicInfo-${username}`);

    if (cachedUser) {
      console.log("cache hit");
      return res.json(JSON.parse(cachedUser));
    }

    const user = await Users.findOne(
      {
        where: {
          username,
        },
      },
      {
        attributes: {
          exclude: ["password"],
        },
      }
    );
    client.set(
      `basicInfo-${username}`,
      JSON.stringify(user),
      "EX",
      DEFAULT_EXPIRATION
    );
    console.log("cache miss");
    return res.json(user);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;

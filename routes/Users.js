require("dotenv").config();

const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { check, validationResult } = require("express-validator");

const { Users } = require("../models");
const { Schedule } = require("../models");
const { MyPageDBs } = require("../models");
const upload = require("../middleware/upload");

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
  console.log("refreshToken:", refreshToken);
  //const { id } = req.body;
  //const id = req.params.id;

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

// userId를 params에 넣어서 그 유저만 볼 수 있게끔 함
router.get("/mypage-trip-history/:username", async (req, res) => {
  try {
    // id는 그냥 로그인 했을떄 나오는 userId쓰기
    const username = req.params.username;
    const user = await Users.findOne({ where: { username } });
    //console.log("user: ", user);
    const mp = await MyPageDBs.findAll({ where: { UserId: user.id } });

    res.json(mp);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.get("/trip-schedule/:username", upload, async (req, res) => {
  try {
    const username = req.params.username;
    const user = await Users.findOne({ where: { username } });
    //console.log("user: ", user);
    const tp = await MyPageDBs.findAll({ where: { UserId: user.id } });

    res.json(tp);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// 마이페이지랑 스케쥴표 동시 저장
router.post("/trip-schedule", upload, async (req, res) => {
  // 마이페이지랑, 일정생성시 front -> server로 id값을 넘겨주기
  // username으로 user_id얻고, user_id로 관련 데이터 스케쥴 테이블에서 다 찾고 스케줄 id 비교로 데이터 뽑기
  try {
    const {
      username,
      days,
      area,
      tripTitle,
      thumbnail,
      description,
      startDate,
      endDate,
    } = req.body;

    let itemList_schedule = [];
    let itemList_mypage = [];

    // user의 id를 page id를 받아야 함.
    const user = await Users.findOne({ where: { username } });
    console.log("user: ", user);
    const page = await MyPageDBs.findOne({ where: { UserId: user.id } });

    // userId를 기반으로 pageId값을 받아와서 해당 pageId를 갖은 애들만 봉줘야함

    days.map((item) => {
      item.places.map((place, index) => {
        Schedule.create({
          day: item.day,
          order: index,
          placeTitle: place.name,
          placeImage: place.img,
          UserId: user.id,
          //page_id: page.id,
        });
      });
    });

    MyPageDBs.create({
      area,
      thumbnail,
      tripTitle,
      description,
      startDay: startDate,
      endDay: endDate,
      UserId: user.id,
    });

    days.map((item) => {
      item.places.map((place, index) => {
        itemList_schedule.push({
          day: item.day,
          order: index,
          placeTitle: place.name,
          placeImage: place.img,
          UserId: user.id,
          //page_id: page.id,
        });
      });
    });

    itemList_mypage.push({
      area,
      thumbnail,
      tripTitle,
      description,
      startDay: startDate,
      endDay: endDate,
      UserId: user.id,
    });

    res.json({
      itemList_schedule,
      itemList_mypage,
      msg: "success",
    });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.get("/:username", async (req, res) => {
  try {
    // id는 그냥 로그인 했을떄 나오는 userId쓰기
    const username = req.params.username;
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

    res.json(user);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;

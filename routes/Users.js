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

// mypage랑 schedule 연결함
// 대표 사진, 제목
router.post("/mypage-trip-history", upload, async (req, res) => {
  try {
    const {
      username,
      area,
      thumbnail,
      tripTitle,
      description,
      startDay,
      endDay,
    } = req.body;

    const user = await Users.findOne({ where: { username } });

    MyPageDBs.create({
      area,
      thumbnail,
      tripTitle,
      description,
      startDay,
      endDay,
      UserId: user.id,
    });
    // 생성 날짜는 front에서 생성된 데이터에서 가져오면 될거같음
    res.json({
      msg: "upload success",
      area,
      thumbnail,
      tripTitle,
      description,
      startDay,
      endDay,
      userId: user.id,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// userId를 params에 넣어서 그 유저만 볼 수 있게끔 함
router.get("/mypage-trip-history/:id", async (req, res) => {
  try {
    // id는 그냥 로그인 했을떄 나오는 userId쓰기
    const id = req.params.id;
    const mp = await MyPageDBs.findAll({ where: { UserId: id } });

    res.json(mp);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.post("/trip-schedule", upload, async (req, res) => {
  // 마이페이지랑, 일정생성시 front -> server로 id값을 넘겨주기
  // username으로 user_id얻고, user_id로 관련 데이터 스케쥴 테이블에서 다 찾고 스케줄 id 비교로 데이터 뽑기
  try {
    const { username, area, startDay, endDay, tripTitle, description, days } =
      req.body;
    let scheduleList = [];

    const user = await Users.findOne({ where: { username } });
    const userId = user.id;
    console.log("user: ", userId);
    // const schedulePageId = await Schedule.findAll({ where: { page_id } });

    // 특정 user가 가지고 있는 모든 여행 기록을 가지고 와서 pageid로 구분해서 보여줌
    const scheduleTableUser = await Schedule.findAll({
      where: { userId: userId },
    });

    // if (schedulePageId && scheduleTableUser) {
    scheduleList.push({
      area,
      startDay,
      endDay,
      tripTitle,
      description,
      days,
    });

    //Schedule.bulkCreate(area, startDay, endDay, tripTitle, description, days);
    const daysData = days.map((item) => {
      return {
        day: item.day,
        places: item.places,
      };
    });

    /*
    console.log("days:", days);
    console.log("days.places", days.places);
    const test = [];
    for (let i = 0; i < days.places.length; i++) {
      test.push(days.places[i]);
    }
    console.log("test:", test);
    // const placesData = places.map((item) => {
    //   return {
    //     name: item.name,
    //     img: item.img,
    //   };
    // });
    */
    console.log("daysData: ", daysData);
    console.log("places: ", daysData.places);
    for (let i = 0; i < days.length; i++) {
      Schedule.create({});
    }
    // console.log("placesData: ", placesData);
    // Schedule.create({
    //   area,
    //   startDay,
    //   endDay,
    //   tripTitle,
    //   description,
    //   day: daysData.days,
    //   placeTitle: daysData.places.name,
    //   placePhoto: daysData.places.img,
    //   order: 1,
    // });

    // 한번에 여러 데이터 삽입하는 방법 -> bulkCreate 이거 써야할거같음
    // scheduleList.map((item) => {
    //   //item.map((itemIdx) => {
    //   Schedule.create({
    //     area,
    //     startDay,
    //     endDay,
    //     tripTitle,
    //     description,

    //     day: days[1].day, //item.days[0].day
    //     order: 1,
    //     placeTitle: "gym",
    //     placeImage:
    //       "http://tong.visitkorea.or.kr/cms/resource/08/2650208_image2_1.jpg",
    //     // order: item.itemIdx,
    //     // placeTitle: item.itemIdx.img,
    //     // placeImage: item.itemIdx.name,
    //     //});
    //   });
    //   console.log("item: ", item.days[0].day);
    //   //item:  [ { day: 1, places: [ [Object], [Object] ] } ]
    // });
    // places.map((place) => {
    //   scheduleList.push({
    //     title: scheduleTableUser.place.title,
    //     scheduleDay: scheduleTableUser.place.scheduleDay,
    //     order: scheduleTableUser.place,
    //     photo: scheduleTableUser.place.placePhoto,
    //   });
    // });
    res.json({ list: scheduleList, msg: "success" });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.get("/trip-schedule", async (req, res) => {
  const { username, scheduleID } = req.body;
  let scheduleList = [];

  const user = await Users.findOne({ where: { username } });
  const userId = user.id;

  const scheduleTableUser = await Schedule.findAll({
    where: { userId: userId },
  });

  if (scheduleTableUser.id == scheduleID) {
    scheduleList.push({
      title: user.title,
      scheduleDay: user.scheduleDay,
      order: user.order,
      photo: user.placePhoto,
    });
    res.json({ list: scheduleList });
  }
});

router.get("/:id", async (req, res) => {});

module.exports = router;

require("dotenv").config();

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

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

module.exports = router;

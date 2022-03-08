const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const axios = require("axios");
const uuidAPIKey = require("uuid-apikey");

// console.log(uuidAPIKey.create()); -> 시스템마다 다른 api키를 제공하면 이값들을 디비에서 관리하면 된다 -> isAPIKey method or check method로 확인가능

router.use(express.urlencoded({ extended: true }));
router.use(bodyParser.json());
require("dotenv").config();

router.get("/", (req, res) => {
  //const word = req.body;
  const { word } = req.query.query;
  console.log("word: ", word);
  axios
    .get("https://openapi.naver.com/v1/search/local.json", {
      params: {
        query: word,
        display: 2,
        start: 1,
        sort: "random",
      },
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_LOCAL_ID_KEY,
        "X-Naver-Client-Secret": process.env.NAVER_LOCAL_SECRET_KEY,
        "Access-Control-Allow-Origin": "*",
      },
    })
    .then((response) => {
      const item = response.data.items;
      res.json(item);
    })
    .catch((error) => {
      res.json({ msg: error });
    });
});

module.exports = router;

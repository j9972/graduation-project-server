const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const axios = require("axios");

router.use(express.urlencoded({ extended: true }));
router.use(bodyParser.json());
require("dotenv").config();

router.get("/search", (req, res) => {
  const word = req.query.query;
  console.log("word: ", word);
  console.log("req.query: ", req.query);
  axios
    .get("https://openapi.naver.com/v1/search/local.json", {
      params: {
        query: word,
        display: 20,
        start: 1,
        sort: "random",
      },
      headers: {
        "X-Naver-Client-Id": process.env.ID_KEY,
        "X-Naver-Client-Secret": process.env.SECRET_KEY,
        "Access-Control-Allow-Origin": "*",
      },
    })
    .then((response) => {
      console.log(response.data.items[0].title);
      const item = response.data.items;
      res.send(item);
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get("/", (req, res) => {
  res.json("hello");
});

module.exports = router;

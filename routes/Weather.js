const express = require("express");
const router = express.Router();
const axios = require("axios");

// express
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// ENV
require("dotenv").config();

// Router -> 지역 선택하는 과정에서 넘어오는 title을 가지고 검색
router.post("/", (req, res) => {
  const data = req.body;
  console.log("title:", data.title);
  axios
    .get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: data.title,
          appid: process.env.OPEN_WEATHER_KEY,
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.status === 200) {
        res.json(response.data);
      }
    })
    .catch((error) => {
      res.json({ msg: error });
      console.log("err:", error);
    });
});

router.get("/", (req, res) => {
  res.json("weather");
  console.log("hi");
});

module.exports = router;

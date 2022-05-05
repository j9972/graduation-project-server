// ENV
require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");

// REDIS
// REDIS
const Redis = require("redis");
const redisClient = Redis.createClient(); // ({url: defualt url})
const DEFAULT_EXPIRATION = 3600; // 3600s = 1hr

redisClient.connect();

const cache = (req, res, next) => {
  const key = req.body;
  redisClient.get(key, (err, data) => {
    if (err) throw err;
    if (data !== null) {
      console.log("Cache Hits");
      res.json(key, data);
    } else {
      console.log("Cache Miss");
      next();
    }
  });
};

// Router -> 지역 선택하는 과정에서 넘어오는 title을 가지고 검색
router.post("/", cache, async (req, res) => {
  const data = req.body;
  console.log("title:", data.title);
  try {
    const response = await axios.get(
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
    );
    if (response.status === 200) {
      const { representData } = await response.json();
      console.log("representData: ", representData);

      //cache data to redis
      redisClient.SETEX(data, representData);

      const items = response.data;
      res.json(items);
    }
  } catch (e) {
    console.error(e);
    res.json({ msg: e });
  }
});

router.get("/", (req, res) => {
  res.json("weather");
});

module.exports = router;

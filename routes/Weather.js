// ENV
require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");

// REDIS
const redis = require("redis");
const client = redis.createClient(); // ({url: defualt url})
const DEFAULT_EXPIRATION = 3600; // 3600s = 1hr

client.connect();

// Router -> 지역 선택하는 과정에서 넘어오는 title을 가지고 검색
router.post("/", async (req, res) => {
  try {
    const data = req.body.title;
    console.log("title:", data);

    // check data which we want
    let cacheData = await client.get(`weather:${data}`);

    // cache hit
    if (cacheData) {
      console.log("cache hit");
      return res.json(JSON.parse(cacheData));
    }

    //cache miss
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: data,
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
      client.set(
        `weather:${data}`,
        JSON.stringify(response.data),
        "EX",
        DEFAULT_EXPIRATION
      );
      console.log("cache miss");
      return res.json(response);
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;

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

/*
const cache = (req, res, next) => {
  const key = req.body;
  client.get(key, (err, data) => {
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
*/

// Router -> 지역 선택하는 과정에서 넘어오는 title을 가지고 검색
router.post("/", async (req, res) => {
  try {
    const data = req.body.title;
    console.log("title:", data);

    // check data which we want
    let cacheData = await client.get(`weather:${data}`);

    // cache hit
    if (cacheData) {
      cacheData = JSON.parse(cacheData);
      // return entry
      return { ...cacheData.data, source: "API" };
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
      client.set(`weather:${data}`, JSON.stringify(response.data), "EX", 3600);
      return { ...response.data, source: "API" };
    }
  } catch (e) {
    console.error(e);
    res.json({ msg: e });
  }
  process.exit();
});

/*
router.post("/", async (req, res) => {
  try {
    const data = req.body.title;
    console.log("title:", data);

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
      const items = response.data;
      res.json(items);
    }
  } catch (e) {
    console.error(e);
    res.json({ msg: e });
  }
});
*/

router.get("/", (req, res) => {
  res.json("weather");
});

module.exports = router;

// ENV
require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");

// REDIS
const Redis = require("redis");
const client = Redis.createClient(); // ({url: defualt url})
const DEFAULT_EXPIRATION = 3600; // 3600s = 1hr

//client.connect();

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


// Router -> 지역 선택하는 과정에서 넘어오는 title을 가지고 검색
router.post("/", (req, res) => {
  const key = req.body.title;
  console.log("key: ", key);
  try {
    console.log("redis before");
    client.get(key, async (err, dataRes) => {
      console.log("redis start");
      if (err) {
        console.log("redis err");
        throw err;
      }

      if (dataRes) {
        console.log("dataRes");
        res.status(200).send({
          dataRes: JSON.parse(dataRes),
          msg: "cache hit",
        });
      } else {
        console.log("else");
        const dataRes = await axios.get(
          "https://api.openweathermap.org/data/2.5/weather",
          {
            params: {
              q: key,
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
        client.SETEX(key, DEFAULT_EXPIRATION, JSON.stringify(dataRes.data));
        res.status(200).send({
          dataRes: dataRes.data,
          msg: "cache miss",
        });
      }
    });
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
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

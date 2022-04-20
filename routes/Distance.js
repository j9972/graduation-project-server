// ENV
require("dotenv").config();

const express = require("express");
const router = express.Router();
const axios = require("axios");

// Router -> 출발지와 도착지 ( 마커 하나하나 거리 )를 차로 이동거리와 이동시간 표시
router.post("/", (req, res) => {
  // 시작점과 도착지의 경도 위도를 받아와야함
  let { start, goal } = req.body;

  let startLocation = start.join();
  let goalLocation = goal.join();

  axios
    .get("https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving", {
      params: {
        start: startLocation,
        goal: goalLocation,
        option: "trafast",
      },
      headers: {
        "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_NCP_ID,
        "X-NCP-APIGW-API-KEY": process.env.NAVER_NCP_SECRET,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      if (response.status === 200) {
        const compareItem = response.data.route.trafast[0].summary;
        // distance(거리) -> m로 표현, time(이동시간)->millisecond로 표현
        res.json({
          distance: compareItem.distance,
          time: compareItem.duration,
        });
      }
    })
    .catch((error) => {
      res.json({ msg: error });
      console.log("err:", error);
    });
});

router.get("/", (req, res) => {
  res.json("distance of marker");
});

module.exports = router;

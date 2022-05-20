const express = require("express");
const router = express.Router();
const axios = require("axios");

// ENV
require("dotenv").config();

// REDIS
const redis = require("redis");
const client = redis.createClient(); // ({url: defualt url})
const DEFAULT_EXPIRATION = 3600; // 3600s = 1hr

client.connect();

// Router -> 지역 선택하는 과정에서 넘어오는 title을 가지고 검색

// 키워드 검색 조회
router.post("/search-keyword", async (req, res) => {
  try {
    const keyword = req.body.keyword;
    console.log(keyword);

    // check data which we want
    let cacheData = await client.get(`searchKeyword:${keyword}`);

    // cache hit
    if (cacheData) {
      console.log("cache hit");
      return res.json(JSON.parse(cacheData));
    }

    const response = await axios.get(
      "http://api.visitkorea.or.kr/openapi/service/rest/KorService/searchKeyword",
      {
        params: {
          serviceKey: process.env.RECOMMEND_COURSE_DATA_API,
          MobileOS: "ETC",
          MobileApp: "GoTrip",
          listYN: "Y",
          _type: "json",
          keyword: keyword,
          contentTypeId: 25,
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
      const courseInfo = response.data.response.body.items.item;
      res.json(courseInfo);

      client.set(
        `searchKeyword:${keyword}`,
        JSON.stringify(courseInfo),
        "EX",
        DEFAULT_EXPIRATION
      );

      console.log("cache miss");
      return res.json(courseInfo);
    }
  } catch (e) {
    console.error(e);
    res.json({ msg: e });
  }
});

// 반복 정보 조회, contentTypeId = 25 => 여행코스 타입, contentId는 keyword로 부터
router.post("/detailInfo", async (req, res) => {
  try {
    const { contentId } = req.body;
    console.log(contentId);

    const response = await axios.get(
      "http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailInfo",
      {
        params: {
          serviceKey: process.env.RECOMMEND_COURSE_DATA_API,
          MobileOS: "ETC",
          MobileApp: "GoTrip",
          _type: "json",
          contentId: contentId,
          contentTypeId: 25,
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
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;

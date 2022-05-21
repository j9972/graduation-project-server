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

// 키워드 검색 조회로 할 수 있음
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
          contentTypeId: 32,
          numOfRows: 100,
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

      client.set(
        `searchKeyword:${keyword}`,
        JSON.stringify(items),
        "EX",
        DEFAULT_EXPIRATION
      );

      console.log("cache miss");
      return res.json(items);
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: e.message });
  }
});

// 소개 정보 조회, contentTypeId = 32
router.post("/detailIntro", async (req, res) => {
  try {
    const { contentId } = req.body;
    console.log(contentId);

    const response = await axios.get(
      "http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailIntro",
      {
        params: {
          serviceKey: process.env.RECOMMEND_COURSE_DATA_API,
          MobileOS: "ETC",
          MobileApp: "GoTrip",
          _type: "json",
          contentId: contentId,
          contentTypeId: 32,
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
      const stayInfo = response.data;
      res.json(stayInfo);
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: e.message });
  }
});

// 숙박 정보 조회, 키워드에서 areaCode가져오기 ( 위랑도 같은 방법임 )
router.post("/search-stay", async (req, res) => {
  try {
    const areaCode = req.body.areaCode;
    console.log(areaCode);

    // check data which we want
    let cacheData = await client.get(`searchStay:${areaCode}`);

    // cache hit
    if (cacheData) {
      console.log("cache hit");
      return res.json(JSON.parse(cacheData));
    }

    const response = await axios.get(
      "http://api.visitkorea.or.kr/openapi/service/rest/KorService/searchStay",
      {
        params: {
          serviceKey: process.env.RECOMMEND_COURSE_DATA_API,
          MobileOS: "ETC",
          MobileApp: "GoTrip",
          _type: "json",
          areaCode: areaCode,
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

      client.set(
        `searchStay:${areaCode}`,
        JSON.stringify(items),
        "EX",
        DEFAULT_EXPIRATION
      );

      console.log("cache miss");
      return res.json(items);
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: e.message });
  }
});
module.exports = router;

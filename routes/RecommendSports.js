const express = require("express");
const router = express.Router();
const axios = require("axios");

//Redis
const redis = require("redis");
const client = redis.createClient();
const DEFAULT_EXPIRATION = 3600; // 3600s = 1hr

client.connect();

// ENV
require("dotenv").config();

// Router -> 행사 / 공연 / 축제 part

// 키워드 검색 조회
router.post("/search-keyword", async (req, res) => {
  try {
    const { keyword } = req.body;
    const contenttypeid = 28;
    console.log(keyword);

    // check data which we want
    let cacheData = await client.get(
      `searchKeyword:${keyword}${contenttypeid}`
    );

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
          contentTypeId: contenttypeid,
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
      const sportInfo = response.data.response.body.items.item;

      client.set(
        `searchKeyword:${keyword}${contenttypeid}`,
        JSON.stringify(sportInfo),
        "EX",
        DEFAULT_EXPIRATION
      );

      console.log("cache miss");
      return res.json(sportInfo);
    }
  } catch (e) {
    console.error(e);
    res.json({ msg: e });
  }
});

// 소개 정보 조회, contentTypeId = 28
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
          contentTypeId: 28,
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

module.exports = router;

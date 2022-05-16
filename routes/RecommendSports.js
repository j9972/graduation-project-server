const express = require("express");
const router = express.Router();
const axios = require("axios");

// ENV
require("dotenv").config();

// Router -> 행사 / 공연 / 축제 part

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
          contentTypeId: 28,
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
        `searchKeyword:${keyword}`,
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
    const contentId = req.body.contentId;
    console.log(contentId);

    // check data which we want
    let cacheData = await client.get(`detailIntro:${contentId}`);

    // cache hit
    if (cacheData) {
      console.log("cache hit");
      return res.json(JSON.parse(cacheData));
    }
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
      client.set(
        `detailIntro:${contentId}`,
        JSON.stringify(items),
        "EX",
        DEFAULT_EXPIRATION
      );

      console.log("cache miss");
      return res.json(items);
    }
  } catch (e) {
    console.error(e);
    res.json({ msg: e });
  }
});

module.exports = router;

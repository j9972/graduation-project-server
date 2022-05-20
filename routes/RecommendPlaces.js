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

// Router -> 행사 / 공연 / 축제 part

// 키워드 검색 조회 -> contentId 가져옴
router.post("/search-keyword", async (req, res) => {
  try {
    const { keyword } = req.body;
    const contenttypeid = 15;

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
      const items = response.data;

      client.set(
        `searchKeyword:${keyword}${contenttypeid}`,
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

// 소개 정보 조회, contentTypeId = 15 => 여행코스 타입, contentId는 keyword로 부터
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
          contentTypeId: 15,
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
      const placeInfo = response.data.response.body.items.item;
      res.json(placeInfo);
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: e.message });
  }
});

// 행사 정보 조회, 소개 정보 조회에서 이벤트 시작날짜 알아오기 ( 이거 할 필요 없음 )
router.post("/search-Festival", async (req, res) => {
  try {
    const eventStartDate = req.body.eventStartDate;
    const contentId = req.body.contentId;
    console.log("contentId: ", contentId);
    console.log("eventStartDate:", eventStartDate);

    // check data which we want
    let cacheData = await client.get(`searchFestival:${contentId}`);

    // cache hit
    if (cacheData) {
      console.log("cache hit");
      return res.json(JSON.parse(cacheData));
    }

    const response = await axios.get(
      "http://api.visitkorea.or.kr/openapi/service/rest/KorService/searchFestival",
      {
        params: {
          serviceKey: process.env.RECOMMEND_COURSE_DATA_API,
          MobileOS: "ETC",
          MobileApp: "GoTrip",
          _type: "json",
          eventStartDate: eventStartDate,
          contentid: contentId,
          listYN: "Y",
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
        `searchFestival:${contentId}`,
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

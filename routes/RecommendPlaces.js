const express = require("express");
const router = express.Router();
const axios = require("axios");

const { RecommendPlaces } = require("../models");

// ENV
require("dotenv").config();

// Router -> 행사 / 공연 / 축제 part

// 키워드 검색 조회 -> contentId 가져옴
router.post("/search-keyword", async (req, res) => {
  const keyword = req.body.keyword;
  console.log(keyword);
  try {
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
          contentTypeId: 15,
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
      res.json(items);
    }
  } catch (e) {
    console.error(e);
    res.json({ msg: e });
  }
});

// 소개 정보 조회, contentTypeId = 15 => 여행코스 타입, contentId는 keyword로 부터
router.post("/detailIntro", async (req, res) => {
  const contentId = req.body.contentId;
  console.log(contentId);
  try {
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
    res.json({ msg: e });
  }
});

// 행사 정보 조회, 소개 정보 조회에서 이벤트 시작날짜 알아오기 ( 이거 할 필요 없음 )
router.post("/search-Festival", async (req, res) => {
  const eventStartDate = req.body.eventStartDate;
  const contentId = req.body.contentId;
  console.log("contentId: ", contentId);
  console.log("eventStartDate:", eventStartDate);
  try {
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
      res.json(items);
    }
  } catch (e) {
    console.error(e);
    res.json({ msg: e });
  }
});

router.get("/", (req, res) => {
  res.json("recommendPlaces");
});

module.exports = router;

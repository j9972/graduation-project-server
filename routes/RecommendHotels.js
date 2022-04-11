const express = require("express");
const router = express.Router();
const axios = require("axios");

const { RecommendHotels } = require("../models");

// 키워드 검색 조회 -> areaCode가져옴
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
      const items = response.data;
      res.json(items);
    }
  } catch (e) {
    console.error(e);
    res.json({ msg: e });
  }
});

// 숙박 정보 조회, 키워드에서 areaCode가져오기
router.post("/search-stay", async (req, res) => {
  const areaCode = req.body.areaCode;
  console.log(areaCode);
  try {
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
      res.json(items);
    }
  } catch (e) {
    console.error(e);
    res.json({ msg: e });
  }
});

module.exports = router;

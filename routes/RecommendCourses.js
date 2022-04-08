const express = require("express");
const router = express.Router();
const axios = require("axios");

const { RecommendCourses } = require("../models");
const { sign } = require("jsonwebtoken");
const { json } = require("sequelize/types");

// express
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// ENV
require("dotenv").config();

// Router -> 지역 선택하는 과정에서 넘어오는 title을 가지고 검색

// 지역코드 조회 -> 검색시 필요한 지역 코드 주어줌
router.post("/areaCode", (req, res) => {
  axios
    .get(
      "http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaCode",
      {
        params: {
          serviceKey: process.env.RECOMMEND_COURSE_DATA_API,
          MobileOS: ETC,
          MobileApp: GoTrip,
          _type: json,
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.status === 200) {
        res.json(response.data);
      }
    })
    .catch((error) => {
      res.json({ msg: error });
      console.log("err:", error);
    });
});

// 지역기반 관광정보 조회, 제목순으로 정렬 ( P -> 조회순 정렬 가능,대표이미지 있음 )
// contentID 사용 해야함 -> 소개정보에
// contentTypeID 사용 해야함 -> 소개정보에
router.post("/areaBasedList", (req, res) => {
  axios
    .get(
      "http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaBasedList",
      {
        params: {
          serviceKey: process.env.RECOMMEND_COURSE_DATA_API,
          MobileOS: ETC,
          MobileApp: GoTrip,
          _type: json,
          arrange: O,
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.status === 200) {
        res.json(response.data);
      }
    })
    .catch((error) => {
      res.json({ msg: error });
      console.log("err:", error);
    });
});

// 키워드 검색 조회
router.post("/searchKeyword", (req, res) => {
  const keyword = req.body;
  axios
    .get(
      "http://api.visitkorea.or.kr/openapi/service/rest/KorService/searchKeyword",
      {
        params: {
          serviceKey: process.env.RECOMMEND_COURSE_DATA_API,
          MobileOS: ETC,
          MobileApp: GoTrip,
          _type: json,
          keyword: keyword,
          arrange: O,
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.status === 200) {
        res.json(response.data);
      }
    })
    .catch((error) => {
      res.json({ msg: error });
      console.log("err:", error);
    });
});

// 행사 정보 조회
router.post("/searchFestival", (req, res) => {
  let eventStartDate = req.body;
  axios
    .get(
      "http://api.visitkorea.or.kr/openapi/service/rest/KorService/searchFestival",
      {
        params: {
          serviceKey: process.env.RECOMMEND_COURSE_DATA_API,
          MobileOS: ETC,
          MobileApp: GoTrip,
          _type: json,
          arrange: O,
          eventStartDate: eventStartDate,
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.status === 200) {
        res.json(response.data);
      }
    })
    .catch((error) => {
      res.json({ msg: error });
      console.log("err:", error);
    });
});

// 행사 정보 조회
router.post("/searchStay", (req, res) => {
  axios
    .get(
      "http://api.visitkorea.or.kr/openapi/service/rest/KorService/searchStay",
      {
        params: {
          serviceKey: process.env.RECOMMEND_COURSE_DATA_API,
          MobileOS: ETC,
          MobileApp: GoTrip,
          _type: json,
          arrange: O,
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.status === 200) {
        res.json(response.data);
      }
    })
    .catch((error) => {
      res.json({ msg: error });
      console.log("err:", error);
    });
});

// 소개 정보 조회
router.post("/detailIntro", (req, res) => {
  const { contentId, contentTypeId } = req.body;
  axios
    .get(
      "http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailIntro",
      {
        params: {
          serviceKey: process.env.RECOMMEND_COURSE_DATA_API,
          MobileOS: ETC,
          MobileApp: GoTrip,
          _type: json,
          contentId: contentId,
          contentTypeId: contentTypeId,
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.status === 200) {
        res.json(response.data);
      }
    })
    .catch((error) => {
      res.json({ msg: error });
      console.log("err:", error);
    });
});

// 반복 정보 조회
router.post("/detailInfo", (req, res) => {
  const { contentId, contentTypeId } = req.body;
  axios
    .get(
      "http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailInfo",
      {
        params: {
          serviceKey: process.env.RECOMMEND_COURSE_DATA_API,
          MobileOS: ETC,
          MobileApp: GoTrip,
          _type: json,
          contentId: contentId,
          contentTypeId: contentTypeId,
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.status === 200) {
        res.json(response.data);
      }
    })
    .catch((error) => {
      res.json({ msg: error });
      console.log("err:", error);
    });
});

router.get("/", (req, res) => {
  res.json("recommendCourse");
});

module.exports = router;

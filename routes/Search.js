const express = require("express");
const router = express.Router();
const axios = require("axios");
const uuidAPIKey = require("uuid-apikey");
const proj4 = require("proj4");

// console.log(uuidAPIKey.create()); -> 시스템마다 다른 api키를 제공하면 이값들을 디비에서 관리하면 된다 -> isAPIKey method or check method로 확인가능

router.use(express.urlencoded({ extended: false }));
router.use(express.json());
require("dotenv").config();

proj4.defs("WGS84", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");
proj4.defs(
  "TM128",
  "+proj=tmerc +lat_0=38 +lon_0=128 +k=0.9999 +x_0=400000 +y_0=600000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43"
);

router.post("/search", (req, res) => {
  const search = req.body.search;
  console.log("search:", search);

  axios
    .get("https://openapi.naver.com/v1/search/local.json", {
      params: {
        query: search,
        display: 1,
        start: 1,
        sort: "random",
      },
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_LOCAL_ID_KEY,
        "X-Naver-Client-Secret": process.env.NAVER_LOCAL_SECRET_KEY,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      if (response.status === 200) {
        const items = response.data.items;

        let lng = parseInt(items[0].mapx, 10);
        let lat = parseInt(items[0].mapy, 10);

        let xy = [lng, lat];
        let resLocation = proj4("TM128", "WGS84", xy);
        console.log("경도 위도 : ", resLocation[0], resLocation[1]);

        items.map((x) => {
          x.title = x.title.replace(/<b>/g, "");
          x.title = x.title.replace(/<\/b>/g, "");
        });

        axios
          .get("https://openapi.naver.com/v1/search/image.json", {
            params: {
              query: search,
              display: 1,
              start: 1,
              sort: "sim",
              filter: "small",
            },
            headers: {
              "X-Naver-Client-Id": process.env.NAVER_LOCAL_ID_KEY,
              "X-Naver-Client-Secret": process.env.NAVER_LOCAL_SECRET_KEY,
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            if (response.status === 200) {
              const item_img = response.data.items;
              /*
            item.map((x) => {
              x.title = x.title.replace(/<b>/g, "");
              x.title = x.title.replace(/<\/b>/g, "");
              // <b> 없애줌
              // 참고로 replace 메서드는 첫번재 파라미터가 리터럴일 경우 일치하는 첫번째 부분만 변경하기 때문에 전부 찾을 수 있도록 정규표현식으로 g를 포함
            });
            */
              // 이미지 url 만 보냄
              res.json({
                title: items[0].title,
                // 경도
                lng: resLocation[0],
                // 위도
                lat: resLocation[1],
                item_img: item_img[0].link,
              });
            }
          })
          .catch((error) => {
            res.json({ msg: error });
            console.log("err:", error);
          });
      }
    })
    .catch((error) => {
      res.json({ msg: error });
      console.log("err:", error);
    });
});

router.post("/photo", async (req, res) => {
  const search = req.body.search;
  console.log("search:", search);

  axios
    .get("https://openapi.naver.com/v1/search/image.json", {
      params: {
        query: search,
        display: 1,
        start: 1,
        sort: "sim",
        filter: "small",
      },
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_LOCAL_ID_KEY,
        "X-Naver-Client-Secret": process.env.NAVER_LOCAL_SECRET_KEY,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      if (response.status === 200) {
        const item = response.data.items;
        /*
        item.map((x) => {
          x.title = x.title.replace(/<b>/g, "");
          x.title = x.title.replace(/<\/b>/g, "");
          // <b> 없애줌
          // 참고로 replace 메서드는 첫번재 파라미터가 리터럴일 경우 일치하는 첫번째 부분만 변경하기 때문에 전부 찾을 수 있도록 정규표현식으로 g를 포함
        });
        */
        // 이미지 url 만 보냄
        res.json(item[0].link);
      }
    })
    .catch((error) => {
      console.log("error:", error);
    });

  //res.json('success connect with server');
});

router.get("/", (req, res) => {
  res.json("hello");
});

module.exports = router;

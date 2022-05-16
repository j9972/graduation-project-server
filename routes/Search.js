const express = require("express");
const router = express.Router();
const axios = require("axios");
const proj4 = require("proj4");

// REDIS
const Redis = require("redis");
const client = Redis.createClient(); // ({url: defualt url})
const DEFAULT_EXPIRATION = 3600; // 3600s = 1hr

// connect redis server with client ( client is closed 에러 prevent )
client.connect();

// ENV
require("dotenv").config();

// proj4 module for lat & lng
proj4.defs("WGS84", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");
proj4.defs(
  "TM128",
  "+proj=tmerc +lat_0=38 +lon_0=128 +k=0.9999 +x_0=400000 +y_0=600000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43"
);

// Router
router.post("/search", async (req, res) => {
  try {
    const search = req.body.search;
    console.log("search:", search);

    // check data which we want
    let cacheData = await client.get(`local.json:${search}`);

    // cache hit
    if (cacheData) {
      console.log("cache hit");
      return res.json(JSON.parse(cacheData));
    }

    // cache miss
    const dataResponse = await axios.get(
      "https://openapi.naver.com/v1/search/local.json",
      {
        params: {
          query: search,
          display: 20,
          start: 1,
          sort: "random",
        },
        headers: {
          "X-Naver-Client-Id": process.env.NAVER_LOCAL_ID_KEY,
          "X-Naver-Client-Secret": process.env.NAVER_LOCAL_SECRET_KEY,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );

    if (dataResponse.status === 200) {
      const items = dataResponse.data.items;
      const itemsInfo = []; // 여기에 데이터를 담아서 res.json 으로 넘길거에요~

      items.map((x) => {
        x.title = x.title.replace(/<b>/g, "");
        x.title = x.title.replace(/<\/b>/g, "");
        // <b> 없애줌
        // 참고로 replace 메서드는 첫번재 파라미터가 리터럴일 경우 일치하는 첫번째 부분만 변경하기 때문에 전부 찾을 수 있도록 정규표현식으로 g를 포함
      });

      //Promise.all 안에 Promise<> 배열을 넣으면 동기처리를 함 ( itemsInfo )
      await Promise.all(
        items.map(async (item) => {
          console.log("item: ", item);
          const response = await axios.get(
            "https://openapi.naver.com/v1/search/image.json",
            {
              params: {
                query: item.title,
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
            }
          );
          if (response.status === 200) {
            const item_img = response.data.items;

            let imgUrl = "";
            if (item_img[0]) {
              imgUrl = item_img[0].link;
            }

            let lng = parseInt(item.mapx, 10);
            let lat = parseInt(item.mapy, 10);
            let xy = [lng, lat];
            let resLocation = proj4("TM128", "WGS84", xy);

            itemsInfo.push({
              title: item.title,
              link: item.link,
              imgUrl,
              address: item.address,
              roadAddress: item.roadAddress,
              lng: resLocation[0],
              lat: resLocation[1],
            });
          }
        })
      );

      client.set(
        `local.json:${search}`,
        JSON.stringify(itemsInfo),
        "EX",
        DEFAULT_EXPIRATION
      );
      console.log("cache miss");
      return res.json(itemsInfo);
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;

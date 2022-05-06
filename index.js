const express = require("express");
const app = express();
const PORT = 3001;
const cors = require("cors");
const morgan = require("morgan");

const helmet = require("helmet");
const compression = require("compression");

// REDIS
const Redis = require("redis");
const redisClient = Redis.createClient(); // ({url: defualt url})
const DEFAULT_EXPIRATION = 3600; // 3600s = 1hr

redisClient.connect();

redisClient.on("connect", () => {
  console.log("connect");
});

redisClient.on("error", (err) => {
  console.error(err);
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));

const db = require("./models");

// 코스 추천
const recommendCoursesRouter = require("./routes/RecommendCourses");
app.use("/recommend-course", recommendCoursesRouter);

// 숙박 추천
const recommendHotelsRouter = require("./routes/RecommendHotels");
app.use("/recommend-stay", recommendHotelsRouter);

// 행사 레포츠 문화 추천
const recommendPlacesRouter = require("./routes/RecommendPlaces");
app.use("/recommend-place", recommendPlacesRouter);

// 레포츠 추천
const recommendSportRouter = require("./routes/RecommendSports");
app.use("/recommend-sport", recommendSportRouter);

// 유저
const userRouter = require("./routes/Users");
app.use("/users", userRouter);

// schedule
const scheduleRouter = require("./routes/Schedules");
app.use("/schedule", scheduleRouter);

// 검색 api
const searchRouter = require("./routes/Search");
app.use("/search", searchRouter);

// 날씨 api
const weatherRouter = require("./routes/Weather");
app.use("/weather", weatherRouter);

// 마커간 거리비교 api
const compareDistanceRouter = require("./routes/Distance");
app.use("/compare-distance", compareDistanceRouter);

// 방문자 수 확인
const visitRouter = require("./routes/Visitor");
app.use("/visitor", visitRouter);

db.sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3001, () => {
      console.log(`server is running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

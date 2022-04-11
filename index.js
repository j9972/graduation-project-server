const express = require("express");
const app = express();
const PORT = 3001;
const cors = require("cors");
const morgan = require("morgan");

const helmet = require("helmet");
const compression = require("compression");

app.use(express.json());
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

// 유저
const userRouter = require("./routes/Users");
app.use("/users", userRouter);

// schedule
const scheduleRouter = require("./routes/Schedules");
app.use("/schedule", scheduleRouter);

// 검색 api
const SearchRouter = require("./routes/Search");
app.use("/search", SearchRouter);

// 날씨 api
const weatherRouter = require("./routes/Weather");
app.use("/weather", weatherRouter);

// 마커간 거리비교 api
const CompareDistanceRouter = require("./routes/Distance");
app.use("/compare-distance", CompareDistanceRouter);

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

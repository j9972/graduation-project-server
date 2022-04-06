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

const recommendCoursesRouter = require("./routes/RecommendCourses");
app.use("/recommendcourse", recommendCoursesRouter);
const recommendHotelsRouter = require("./routes/RecommendHotels");
app.use("/recommendhotel", recommendHotelsRouter);
const recommendPlacesRouter = require("./routes/RecommendPlaces");
app.use("/recommendplace", recommendPlacesRouter);
const userRouter = require("./routes/Users");
app.use("/users", userRouter);
const scheduleRouter = require("./routes/Schedules");
app.use("/schedule", scheduleRouter);
const SearchRouter = require("./routes/Search");
app.use("/search", SearchRouter);
const weatherRouter = require("./routes/Weather");
app.use("/weather", weatherRouter);
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

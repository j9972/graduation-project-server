const express = require("express");
const router = express.Router();
const axios = require("axios");

// express
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// DB 불러옴
const { Visitor } = require("../models");

// ENV
require("dotenv").config();

// Router
router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://api.ipify.org?format=json");

    const ip = response.data.ip;

    const Ip = await Visitor.findOne({ where: { ip } });

    let currentTime = new Date();
    const dateTime =
      currentTime.getFullYear() +
      "/" +
      currentTime.getMonth() +
      "/" +
      currentTime.getDate();

    console.log(dateTime);
    // const TotalCount = Visitor.totalCount;
    // const TodayCount = Visitor.todayCount;

    if (!Ip) {
      Visitor.create({
        ip,
        totalCount: 1,
        todayCount: 1,
        date: dateTime,
      });
    }

    // if (Ip) {
    //   Visitor.update({
    //     totalCount: TotalCount + 1,
    //   });
    //   console.log("check1");
    //   if (Visitor.date === dateTime) {
    //     Visitor.update({
    //       todayCount: TodayCount + 1,
    //     });
    //     console.log("check2");
    //   } else {
    //     Visitor.update({
    //       todayCount: 1,
    //       date: dateTime,
    //     });
    //     console.log("check3");
    //     return res.status(200).json({
    //       checkMsg: [
    //         {
    //           msg: "It Doesnt Over Midnight So We Cant Count This Time",
    //         },
    //       ],
    //     });
    //   }
    // }

    res.json({
      msg: "success",
      //   TotalCount,
      //   TodayCount,
      dateTime,
    });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;

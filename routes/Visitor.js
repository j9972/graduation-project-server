const express = require("express");
const router = express.Router();
const axios = require("axios");

// DB 불러옴
const { Visitor } = require("../models");

// ENV
require("dotenv").config();

// Router
router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://api.ipify.org?format=json");

    console.log("response:", response);

    const ip = response.data.ip;

    const Ip = await Visitor.findOne({ where: { ip } });
    // const TotalCount = await Visitor.findOne({ where: { totalCount } });

    let currentTime = new Date();
    const dateTime =
      currentTime.getFullYear() +
      "/" +
      currentTime.getMonth() +
      "/" +
      currentTime.getDate();

    console.log("dateTime:", dateTime, "ip", ip);

    if (!Ip) {
      Visitor.create({
        ip,
        totalCount: 1,
        todayCount: 1,
        date: dateTime,
      });
    }

    if (Ip) {
      console.log("check1");
      if (Ip.ip === ip) {
        if (Ip.date === dateTime) {
          console.log("check2");
          return res.status(200).json({
            checkMsg: [
              {
                msg: "It Doesnt Over Midnight So We Cant Count This Time",
              },
            ],
          });
        } else {
          console.log("check3");
          Visitor.update(
            {
              totalCount: Ip.totalCount + 1,
              todayCount: 1,
              date: dateTime,
            },
            {
              where: {
                ip,
              },
            }
          );
        }
      } else {
        console.log("check4");
        Visitor.create({
          ip,
          totalCount: Ip.totalCount + 1,
          todayCount: 1,
          date: dateTime,
        });
      }
    }

    res.json({
      msg: "success",
      dateTime,
    });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;

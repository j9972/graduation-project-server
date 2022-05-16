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
      if (Ip.ip === ip) {
        if (Ip.date === dateTime) {
          return res.status(200).json({
            checkMsg: [
              {
                msg: "It Doesnt Over Midnight So We Cant Count This Time",
              },
            ],
          });
        } else {
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
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;

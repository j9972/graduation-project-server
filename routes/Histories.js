require("dotenv").config();

const express = require("express");
const router = express.Router();

const { Users, Schedule, MyPageDBs } = require("../models");
const { validateToken } = require("../middleware/AuthMiddleware");

// 개인이 소유한 기록물들 보여주기
// 이렇게하면 id 만 받아오니까 전부 보여줌

router.get(
  "/mypage-trip-history/:username",
  validateToken,
  async (req, res) => {
    try {
      const { username } = req.params;

      const user = await Users.findOne({ where: { username } });

      const mp = await MyPageDBs.findAll({ where: { UserId: user.id } });

      res.json(mp);
    } catch (e) {
      res.status(400).json({ msg: e.message });
    }
  }
);

router.get("/trip-schedule/:username/:id", validateToken, async (req, res) => {
  try {
    const { username, id } = req.params;

    const user = await Users.findOne({ where: { username } });
    const tp = await Schedule.findAll({
      where: {
        page_id: id,
        UserId: user.id,
      },
    });

    res.json(tp);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// 마이페이지랑 스케쥴표 동시 저장
router.post("/trip-schedule", validateToken, async (req, res) => {
  // 마이페이지랑, 일정생성시 front -> server로 id값을 넘겨주기
  // username으로 user_id얻고, user_id로 관련 데이터 스케쥴 테이블에서 다 찾고 스케줄 id 비교로 데이터 뽑기
  try {
    const {
      username,
      days,
      area,
      tripTitle,
      thumbnail,
      description,
      startDate,
      endDate,
    } = req.body;

    // user의 id를 page id를 받아야 함.
    const user = await Users.findOne({ where: { username } });

    const itemList_mypage = await MyPageDBs.create({
      area,
      thumbnail,
      tripTitle,
      description,
      startDay: startDate,
      endDay: endDate,
      UserId: user.id,
    });
    console.log("itemList_mypage: ", itemList_mypage.id);
    //const page = await MyPageDBs.findOne({ where: { UserId: user.id } });

    const itemList_schedule = await Promise.all(
      days.map(async (item) => {
        return await Promise.all(
          item.places.map((place, index) => {
            return Schedule.create({
              day: item.day,
              order: index,
              placeTitle: place.name,
              placeImage: place.img,
              UserId: user.id,
              page_id: itemList_mypage.id,
            });
          })
        );
      })
    );

    res.json({
      itemList_schedule,
      itemList_mypage,
      msg: "success",
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: e.message });
  }
});

router.delete(
  "/mypage-trip-history/:username/:id",
  validateToken,
  async (req, res) => {
    try {
      const { username, id } = req.params;

      const user = await Users.findOne({ where: { username } });
      await Schedule.destroy({
        where: {
          page_id: id,
          UserId: user.id,
        },
      });

      await MyPageDBs.destroy({
        where: {
          id,
          UserId: user.id,
        },
      });

      res.json("DELETE SUCCESS");
    } catch (e) {
      res.status(400).json({ msg: e.message });
    }
  }
);

module.exports = router;

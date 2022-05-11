const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const { Schedules } = require("../models");
const { testImages } = require("../models");

router.post("/upload", upload, async (req, res) => {
  try {
    const image = req.body.image;
    console.log("image: ", image);

    testImages.create({
      image,
    });
    res.json(image);
  } catch (e) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const images = await testImages.findAll();
    console.log("images:", images);
    res.send({ msg: "success", images });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;

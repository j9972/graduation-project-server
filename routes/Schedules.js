const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const { testImages } = require("../models");

router.post("/upload", upload, async (req, res) => {
  try {
    const image = req.body.image;

    testImages.create({
      image,
    });
    res.json(image);
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: e.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const images = await testImages.findAll();

    res.send({ msg: "success", images });
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;

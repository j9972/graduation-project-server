const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");

const { RecommendHotels } = require("../models");

const { sign } = require("jsonwebtoken");

module.exports = router;

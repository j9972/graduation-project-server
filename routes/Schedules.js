const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");

const { Schedules } = require("../models");

const { sign } = require("jsonwebtoken");

module.exports = router;

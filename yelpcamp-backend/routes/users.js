const express = require("express")
const router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require("../controllers/users")


const { storeReturnTo } = require("../middleware");

router.route("/register")
    .post(catchAsync(users.register));

router.route("/login")
    .post(catchAsync(users.login))

router.post('/logout', users.logout);

router.post("/userData", users.userData)

module.exports = router
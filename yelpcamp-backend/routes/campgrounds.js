const express = require("express")
const router = express.Router()
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isCampOwner, validateCampground } = require("../middleware");
const campgrounds = require("../controllers/campgrounds")
const multer = require('multer')

const { storage } = require("../cloudinary/index")
const upload = multer({ storage })

const { campgroundSchema } = require('../schemas');

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("images"), campgroundSchema, validateCampground, catchAsync(campgrounds.createCampground));


router.get("/getCampgroundsByUser/:username", catchAsync(campgrounds.getCampsByUser))

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isCampOwner, upload.array("images"), campgroundSchema, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isCampOwner, catchAsync(campgrounds.deleteCampground));

module.exports = router;
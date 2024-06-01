const express = require("express")
const router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync');
const reviews = require("../controllers/reviews")

const { isLoggedIn, validateReview, isReviewOwner } = require("../middleware")
const { reviewSchema } = require("../schemas")

router.post("/", isLoggedIn, reviewSchema, validateReview, catchAsync(reviews.createReview))

router.delete("/:reviewId", isLoggedIn, isReviewOwner, catchAsync(reviews.deleteReview))

module.exports = router
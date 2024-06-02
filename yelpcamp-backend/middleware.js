const Campground = require("./models/campground")
const Review = require("./models/review")
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');

const { validationResult } = require('express-validator');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!');
        return res.statusCode(400).json({ error: "You must be signed in first!" })
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {
    const errors = validationResult(req).array();
    if (errors.length) {
        let errorMsg = ""
        for (err of errors)
            errorMsg += err.msg + "\n"
        throw new ExpressError(errorMsg, 400)
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const errors = validationResult(req).array();

    if (errors.length) {
        let errorMsg = ""
        for (err of errors)
            errorMsg += err.msg + "\n"
        throw new ExpressError(errorMsg, 400)
    }
    next();
}

module.exports.isCampOwner = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        return res.statusCode(400).json({ error: "you dont have permission for that" })
    }
    next()
})

module.exports.isReviewOwner = catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        return res.statusCode(400).json({ error: "you dont have permission for that" })
    }
    next();
})
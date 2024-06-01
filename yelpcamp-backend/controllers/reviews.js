const Campground = require("../models/campground")
const Review = require("../models/review")

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body);
    review.author = req.user._id
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.json({
        success: true,
        review: {
            _id: review._id, body: review.body, rating: review.rating,
            author:
                { _id: req.user._id, username: req.user.username }
        }
    })
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    console.log(id, reviewId)
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId)
    res.json({ success: true })
}
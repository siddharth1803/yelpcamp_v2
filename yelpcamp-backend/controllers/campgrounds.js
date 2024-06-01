const Campground = require("../models/campground")
const { cloudinary } = require("../cloudinary/index")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken })
const ExpressError = require("../utils/ExpressError")
const User = require("../models/user");

module.exports.index = async (req, res) => {

    const campgrounds = await Campground.find()
    res.json(campgrounds)

}

module.exports.getCampsByUser = async (req, res) => {
    const { username } = req.params
    let userData = await User.findOne({ username: username })
    if (userData == null)
        throw new ExpressError("user not found", 404)
    let campgrounds = await Campground.find({ author: userData._id });
    res.json(campgrounds)

}

module.exports.createCampground = async (req, res) => {
    let geoData = await geoCoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()

    if (geoData.body.features.length === 0) {
        return res.status(400).json({ success: false, message: "invalid location" })
    }

    const campground = new Campground(req.body)
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id
    await campground.save()
    res.json({ success: true, campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    let geoData = await geoCoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()

    if (geoData.body.features.length === 0) {
        return res.status(400).json({ success: false, message: "invalid location" })
    }
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body })
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.geometry = geoData.body.features[0].geometry
    campground.images.push(...images)
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    res.json({ success: true, campground })
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id);
    res.json({ success: true })
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: "reviews", populate: {
                path: "author",
                select: "username"
            }
        })
        .populate("author")
    if (!campground) {
        req.status(400).json({ success: false, error: 'Cannot find that campground!' });
    }
    res.json(campground)
}


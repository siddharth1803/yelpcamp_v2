const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require('./review')


const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/c_fill,w_200,h_200');
});

ImageSchema.virtual('indexImage').get(function () {
    return this.url.replace('/upload', '/upload/c_fill,w_800,h_600');
});

ImageSchema.virtual('campImage').get(function () {
    return this.url.replace('/upload', '/upload/c_fill,w_1000,h_800');
});

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, { toJSON: { virtuals: true } })

CampgroundSchema.virtual('properties.popup').get(function () {
    return `<strong><a href=/campground/?id=${this._id}>${this.title}</a><strong><p>${this.description.substring(0, 30)}...</p>`;
});


CampgroundSchema.post('findOneAndDelete', async function (camp) {
    if (camp) {
        await Review.deleteMany({
            _id: { $in: camp.reviews }
        })
    }
})

module.exports = mongoose.model("Campground", CampgroundSchema)
const mongoose = require('mongoose');
require("dotenv").config()
const cities = require('./cities');
const { places, descriptors, images, descriptions } = require('./seedHelpers');
const Campground = require("../models/campground")
//const uri = `mongodb+srv://${process.env.ATLAS_USER}:${process.env.ATLAS_PASS}@cluster0.janse90.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/yelp-camp`;
const uri = 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(uri).then(() => {
    console.log("connected to db")
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
})

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    // await Campground.deleteMany({});
    for (let i = 0; i < 20; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const random6 = Math.floor(Math.random() * images.length);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "66594d6d02a2af0e92e8312c",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: sample(descriptions),
            price,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: images[random6]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
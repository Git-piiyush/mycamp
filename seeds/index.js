const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/mycamp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: '60a7bd70f151d1392476aa14',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}  `,
            description: "Hey there I am the description of the image ",
            price: Math.floor(Math.random() * 50),
            images: [
                {
                    url: 'https://res.cloudinary.com/dcalmcalm/image/upload/v1621683206/myCamp/brulxa0wee3jemzjfozz.jpg',
                    filename: 'myCamp/brulxa0wee3jemzjfozz'
                },
                {
                    url: 'https://res.cloudinary.com/dcalmcalm/image/upload/v1621683207/myCamp/cjika1zkpjypqiipxo6o.jpg',
                    filename: 'myCamp/cjika1zkpjypqiipxo6o'

                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
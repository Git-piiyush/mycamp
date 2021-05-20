const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { joiCampgroundSchema, joireviewSchema } = require('./schemas');
const Review = require('./models/review')

const mongoose = require('mongoose');
const { findById } = require('./models/campground');
mongoose.connect('mongodb://localhost:27017/mycamp', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error"));
db.once('open', () => console.log("Mongoose connected !!"));

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))  // to parse the req.body

const methodOverride = require('method-override');  //to delete and update
// const campground = require('./models/campground');
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = joiCampgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = joireviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.send("Hello!!");
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });

})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {

    const newCampground = new Campground(req.body)
    await newCampground.save()
    res.redirect(`/campgrounds/${newCampground._id}`)
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {

    const campground = await Campground.findById(req.params.id);

    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, req.body);
    res.redirect(`/campgrounds/${camp._id}`)
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {

    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews')
    console.log(campground)
    res.render('campgrounds/show', { campground })

}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
}));


//Review routes
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {

    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review);
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params
    Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))




// middleware for error handling

app.all('*', (req, res, next) => {
    next(new ExpressError("Page not found", 404));
})


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) { err.message = "Something went wrong" };
    res.status(statusCode).render('errors', { err });

})


app.listen(3000, () => {
    console.log("Listening to the port 3000!!")
})

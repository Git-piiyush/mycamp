const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError');
const session = require('express-session')
const flash = require('connect-flash')
//Routes require
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

// Mongodb connection
const mongoose = require('mongoose');
const { findById } = require('./models/campground');
mongoose.connect('mongodb://localhost:27017/mycamp', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error"));
db.once('open', () => console.log("Mongoose connected !!"));

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))  // to parse the req.body

const methodOverride = require('method-override');  //to delete and update
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')))


const sessionConfig = {
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
    res.locals.success = req.flash('success'); //make success variable available to our all local files.
    res.locals.error = req.flash('error');
    next();
})


//Passing our defined routes
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)


app.get('/', (req, res) => {
    res.send("Hello!!");
})


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

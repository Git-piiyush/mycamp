if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}



const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError');

//session and flash
const session = require('express-session')
const flash = require('connect-flash')

//Routes 
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

//Passport
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user');

// Mongodb connection
const mongoose = require('mongoose');
// const { findById } = require('./models/campground');
mongoose.connect('mongodb://localhost:27017/mycamp', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error"));
db.once('open', () => console.log("Mongoose connected !!"));

// app configurations
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



//must be used after session()
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser()) //Store in the session
passport.deserializeUser(User.deserializeUser())

//placed just before passport middleware in order to hide logout link
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // Can access user information through passwort in every template
    res.locals.success = req.flash('success'); //res.locals make success variable available to our all local files.
    res.locals.error = req.flash('error');
    next();
})

//Passing our defined routes
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes)


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

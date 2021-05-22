// if (process.env.NODE_ENV !== "production") {
require('dotenv').config()
// }



const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError');
const mongoSanitize = require('express-mongo-sanitize');

//session and flash
const session = require('express-session')
const flash = require('connect-flash')
const helmet = require('helmet')

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
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/mycamp'
mongoose.connect(dbUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error"));
db.once('open', () => console.log("Mongoose connected !!"));


const MongoStore = require("connect-mongo")

// app configurations
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))  // to parse the req.body

const methodOverride = require('method-override');  //to delete and update
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

// To remove data, use:
app.use(mongoSanitize());


const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
const sessionConfig = {
    store:store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        name: 'session',
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcalmcalm/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



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
    res.render('home');
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

const port = process.env.PORT || 3000 ;
app.listen(port, () => {
    console.log(`Listening to the port ${port}!!`)
})

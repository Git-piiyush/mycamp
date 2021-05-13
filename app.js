const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const Campground = require('./models/campground');

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

const methodOverride = require('method-override');
const campground = require('./models/campground');
app.use(methodOverride('_method'));

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

app.post('/campgrounds', async (req, res) => {
    const newCampground = new Campground(req.body)
    await newCampground.save()
    res.redirect(`/campgrounds/${newCampground._id}`)
})

app.get('/campgrounds/:id/edit', async (req, res) => {

    const campground = await Campground.findById(req.params.id);

    res.render('campgrounds/edit', { campground })
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, req.body);
    res.redirect(`/campgrounds/${camp._id}`)
})

app.get('/campgrounds/:id', async (req, res) => {

    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground })

})

app.delete('/campgrounds/:id' , async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
})




app.listen(3000, () => {
    console.log("Listening to the port 3000!!")
})

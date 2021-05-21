const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync');


const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
// const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds');



router.route('/')
    .get( catchAsync(campgrounds.index))
    .post( isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .put( isAuthor, isLoggedIn, validateCampground, catchAsync(campgrounds.updateCampground))
    .get( catchAsync(campgrounds.showCampground))
    .delete( isAuthor, isLoggedIn, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))





module.exports = router;
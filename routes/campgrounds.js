const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const { storage } = require('../cloudinary/index')
const multer = require('multer')
const upload = multer({ storage })


const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');



router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .put( isLoggedIn,isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .get(catchAsync(campgrounds.showCampground))
    .delete(isAuthor, isLoggedIn, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))





module.exports = router;
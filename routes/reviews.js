const express = require('express')
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const { joireviewSchema } = require('../schemas');
const Review = require('../models/review')
const { isLoggedIn, isReviewAuthor } = require('../middleware')


const validateReview = (req, res, next) => {
    const { error } = joireviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}




//Review routes
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {

    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review);
    await review.save()
    await campground.save()
    req.flash('success', 'Created new review')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params
    Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))


module.exports = router;
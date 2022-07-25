const express = require('express');
const catchAsync = require('./../utils/catchAsync');
const ExpressError = require('./../utils/ExpressError');
const Campground = require('./../models/campground');
const { campgroundSchema } = require('./../schemas');
const router = express.Router();

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

router.get('/', catchAsync(async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
}));

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
	const campground = new Campground(req.body.campground);
	await campground.save();
	res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/new', (req, res) => {
	res.render('campgrounds/new');
});

router.get('/:id', catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id).populate('reviews');
	res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	res.render('campgrounds/edit', { campground });
}));

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
	const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
	res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id);
	res.redirect('/campgrounds');
}));

module.exports = router;
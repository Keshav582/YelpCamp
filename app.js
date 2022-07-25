const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
require('dotenv').config();
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGOURI);
		startApp();
	} catch (e) {
		console.log('Unable to connect to DB');
	}
};
connectDB();

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

app.get('/', (req, res) => {
	res.render('home');
});

app.get('/campgrounds', catchAsync(async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
}));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
	const campground = new Campground(req.body.campground);
	await campground.save();
	res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id).populate('reviews');
	res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
	const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
	res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id);
	res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	const review = new Review(req.body.review);
	campground.reviews.push(review);
	await review.save();
	await campground.save();
	res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:campgroundID/reviews/:reviewID', catchAsync(async (req, res) => {
	const { campgroundID, reviewID } = req.params;
	await Campground.findByIdAndUpdate(campgroundID, { $pull: { reviews: reviewID } });
	await Review.findByIdAndDelete(reviewID);
	res.redirect(`/campgrounds/${campgroundID}`);
}));

app.all('*', (req, res, next) => {
	next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh No, Something Went Wrong!';
	res.status(statusCode).render('error', { err });
});

const startApp = () => {
	app.listen(3000, () => {
		console.log('Server running on port 3000');
	});
};
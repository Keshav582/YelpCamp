const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

const ExpressError = require('./utils/ExpressError');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

const sessionConfig = {
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000*60*60*24*7,
		maxAge: 1000*60*60*24*7
	}
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
	res.locals.success = req.flash('success'); // if there is a flash message on request, it will now be accessible
	// to all templates without having to pass as parameter
	res.locals.error = req.flash('error');
	next();
})

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGOURI);
		startApp();
	} catch (e) {
		console.log('Unable to connect to DB');
	}
};
connectDB();

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
	res.render('home');
});

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
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
require('dotenv').config();
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGOURI);
		startApp();
	} catch (e) {
		console.log('Unable to connect to DB');
	}
};
connectDB();

app.get('/', (req, res) => {
	res.render('home');
});

app.get('/campgrounds', async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/:id', async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	res.render('campgrounds/show', { campground });
});

const startApp = () => {
	app.listen(3000, () => {
		console.log('Server running on port 3000');
	});
};
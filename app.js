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

app.get('/makecampground', async (req, res) => {
	const camp = new Campground({ title: 'First Campground' });
	await camp.save();
	res.send(camp);
});

const startApp = () => {
	app.listen(3000, () => {
		console.log('Server running on port 3000');
	});
};
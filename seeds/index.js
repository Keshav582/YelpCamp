const mongoose = require('mongoose');
require('dotenv').config();
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect(process.env.MONGOURI);

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			image: 'https://source.unsplash.com/collection/483251',
			title: `${sample(descriptors)} ${sample(places)}`,
			description: 'lorem ipsum dit dolor amet yao ming huan sao mitsung samsung google apple microsoft amazon' +
				' deloitte adobe netflix',
			price
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
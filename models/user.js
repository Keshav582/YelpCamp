const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	}
});

UserSchema.plugin(passportLocalMongoose); // adds username and password for us

module.exports = mongoose.model('User', UserSchema);
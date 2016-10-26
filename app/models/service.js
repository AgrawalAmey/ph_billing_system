var mongoose = require('mongoose');

// define the schema for our user model
var serviceSchema = mongoose.Schema({
    name : {
        type: String,
        unique: true,
    },
    price : Number
});

// create the model for services and expose it to our app
module.exports = mongoose.model('service', serviceSchema);
var mongoose = require('mongoose');
var ShortId = require('mongoose-minid');

// define the schema for our user model
var patientSchema = mongoose.Schema({
    _id : {
        type: ShortId,
        len: 9
    },
    first_name : String,
    last_name : String,
    city : String,
    number : String,
    gender : String,
    dob : String
});

// create the model for patients and expose it to our app
module.exports = mongoose.model('patient', patientSchema);
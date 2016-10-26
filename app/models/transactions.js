var mongoose = require('mongoose');
var ShortId = require('mongoose-minid');

// define the schema for our user model
var transactionSchema = mongoose.Schema({
    _id: {
        type: ShortId,
        len: 9
    },
    customer_number : String,
    service: String,
    date : String
});

// create the model for transactions and expose it to our app
module.exports = mongoose.model('transactions', transactionSchema);
var mongoose = require('mongoose');
var User       = require('./app/models/user');
mongoose.connect('mongodb://127.0.0.1/ph');
var newUser            = new User();
newUser.username = "admin";
newUser.password = newUser.generateHash("pass");
newUser.name = "Dipak Agrawal";
newUser.number = "9422922404";
newUser.isAdmin = true;
newUser.save(function(err) {
    if (err)
        throw err;
    console.log("Added");
    return;
});
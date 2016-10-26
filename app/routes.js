var express = require('express');

// load up the user model
var Users = require('./models/user');
var Services = require('./models/service');
var Patients = require('./models/patient');
var Transactions = require('./models/transactions');

var helpers = require('./helpers');


module.exports = function(app, passport) {

    // =====================================
    // LOGIN ===============================
    // =====================================

    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    // process the login form
    app.post('/login', passport.authenticate('login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // HOME PAGE (once logged in) ==========
    // =====================================

    app.get('/', isLoggedIn, function(req, res) {
        if (req.user.isAdmin) {
            res.redirect('/transactions');
        } else {
            res.redirect('/receptionDesk');
        }
    });

    // =====================================
    // Reception Desk ======================
    // =====================================

    app.get('/receptionDesk', isLoggedIn, function(req, res) {
        if (req.user.isAdmin) {
            res.redirect('/forbidden');
        }
        Services.find({}, function(err, services) {
            var serviceNameList = [];
            for (var i = 0; i < services.length; i++) {
                serviceNameList.push(services[i].name);
            }
            res.render('reception_desk.ejs', {
                user: req.user,
                serviceNameList: serviceNameList,
                addTransactionAndPatientError: req.flash('addTransactionAndPatientError'),
                addTransactionAndPatientSuccess: req.flash('addTransactionAndPatientSuccess'),
                addTransactionError: req.flash('addTransactionError'),
                addTransactionSuccess: req.flash('addTransactionSuccess')
            });
        });
    });

    // =====================================
    // Daily Transactions ==================
    // =====================================
    app.get('/dailyTransactions', isLoggedIn, function(req, res) {
        if (req.user.isAdmin) {
            res.redirect('/transactions');
        }
        getTransactions(req, res, getDate());
    });

    // =====================================
    // Daily Transactions ==================
    // =====================================
    app.get('/transactions', isLoggedIn, isAdmin, function(req, res) {
        getTransactions(req, res, getDate());
    });

    app.post('/transactions', isLoggedIn, isAdmin, function(req, res) {
        getTransactions(req, res, req.body.date);
    });

    // =====================================
    // Manage users ========================
    // =====================================

    app.get('/manageUsers', isLoggedIn, isAdmin, function(req, res) {
        Users.find({}, function(err, users) {
            var usernameList = [];
            for (var i = 0; i < users.length; i++) {
                usernameList.push(users[i].username);
            }
            res.render('manage_users.ejs', {
                user: req.user,
                usernameList: usernameList,
                addUserError: req.flash('addUserError'),
                editUserError: req.flash('editUserError'),
                removeUserError: req.flash('removeUserError'),
                addUserSuccess: req.flash('addUserSuccess'),
                editUserSuccess: req.flash('editUserSuccess'),
                removeUserSuccess: req.flash('removeUserSuccess'),
            });
        });
    });

    // =====================================
    // Manage services =====================
    // =====================================

    app.get('/manageServices', isLoggedIn, isAdmin, function(req, res) {
        Services.find({}, function(err, services) {
            var serviceNameList = [];
            for (var i = 0; i < services.length; i++) {
                serviceNameList.push(services[i].name);
            }
            res.render('manage_services.ejs', {
                user: req.user,
                serviceNameList: serviceNameList,
                addServiceError: req.flash('addServiceError'),
                editServiceError: req.flash('editServiceError'),
                removeServiceError: req.flash('removeServiceError'),
                addServiceSuccess: req.flash('addServiceSuccess'),
                editServiceSuccess: req.flash('editServiceSuccess'),
                removeServiceSuccess: req.flash('removeServiceSuccess'),
            });
        });
    });

    // =====================================
    // Account Settings ====================
    // =====================================

    app.get('/accountSettings', isLoggedIn, function(req, res) {
        res.render('account_setting.ejs', {
            user: req.user,
            editUserError: req.flash('editUserError'),
            editUserSuccess: req.flash('editUserSuccess')
        });
    });

    // =====================================
    // Add/Edit/Remove user ================
    // =====================================

    app.post('/addUser', isLoggedIn, isAdmin, helpers.addUser);

    app.post('/editUser', isLoggedIn, isAdmin, function(req, res) {
        helpers.editUser(req, res, '/manageUsers')
    });

    app.post('/changeProfile', isLoggedIn, isAdmin, function(req, res) {
        helpers.editUser(req, res, '/accountSettings')
    });

    app.post('/removeUser', isLoggedIn, isAdmin, helpers.removeUser);

    // =====================================
    // Add/Edit/Remove service =============
    // =====================================

    app.post('/addService', isLoggedIn, isAdmin, helpers.addService);

    app.post('/editService', isLoggedIn, isAdmin, helpers.editService);

    app.post('/removeService', isLoggedIn, isAdmin, helpers.removeService);

    // =====================================
    // Add transaction and patient =========
    // =====================================

    app.post('/addTransactionAndPatient', isLoggedIn, helpers.addTransactionAndPatient);

    // =====================================
    // Add transaction =====================
    // =====================================

    app.post('/addTransaction', isLoggedIn, helpers.addTransaction);

    // =====================================
    // LOGOUT ==============================
    // =====================================

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

// route middleware to make sure a user is admin
function isAdmin(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.user.isAdmin || req.body.username == req.user.username);
    return next();

    // if they aren't redirect them to the home page
    res.redirect('/forbidden');
}

function getDate() {
    var rightNow = new Date();
    return rightNow.toISOString().slice(0, 10).replace(/-/g, "/");
}

function getTransactions(req, res, date) {
    var data = {}

    data.patientDetails = [];
    data.serviceDetails = [];
    data.amount = 0;
    data.req = req;
    data.res = res;

    Transactions.find({
        'date': date
    }, function(err, transactions) {
        data.transactions = transactions;
        postTransactionQuery(err, transactions, data);
    });
}

function postTransactionQuery(err, transactions, data) {

    for (var i = 0; i < transactions.length; i++) {
        data.i = i;
        Patients.findOne({
            '_id': transactions[i].customer_number
        }, function(err, patient) {
            postPatientQuery(err, patient, data);
        });
    }

    if (transactions.length == 0) {
        renderTransactions(data);
    }
}

function postPatientQuery(err, patient, data) {
    if (err)
        data.res.redirect('/');

    data.patientDetails.push(patient);

    Services.findOne({
        'name': data.transactions[data.i].service
    }, function(err, service) {
        postServiceQuery(err, service, data);
    });
}

function postServiceQuery(err, service, data) {
    if (err)
        data.res.redirect('/');

    data.serviceDetails.push(service);

    data.amount += service.price;

    if (data.i == data.transactions.length - 1) {
        renderTransactions(data);
    }
}

function renderTransactions(data) {
    var renderData = {
        user: data.req.user,
        patients: data.patientDetails,
        services: data.serviceDetails,
        amount: data.amount
    };

    if (data.req.user.isAdmin) {
        data.res.render('transactions.ejs', renderData);
    } else {
        data.res.render('daily_transactions.ejs', renderData);
    }
}
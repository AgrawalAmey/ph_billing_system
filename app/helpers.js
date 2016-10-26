var Users = require('./models/user');
var Services = require('./models/service'); 
var Patients = require('./models/patient');
var Transactions = require('./models/transactions');

module.exports = {

    // =========================================================================
    // Login ================================================================
    // =========================================================================
    
    processLogin: function(req, username, password, done) {
        // asynchronous
        process.nextTick(function() {
            Users.findOne({ 'username' :  username }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(null, false, req.flash('loginMessage', 'Oops! Something went wrong.'));
    
                // if no user is found, return the message
                if (!user){  
                    return done(null, false, req.flash('loginMessage', 'Incorrect username.'));        
                }
                if (!user.validPassword(password)){
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                }
    
                // all is well, return user
                else
                    return done(null, user);
            });
        });
    },
    
    // =========================================================================
    // Add User ================================================================
    // =========================================================================
    
    addUser: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {
    
            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            Users.findOne({'username': req.body.username}, function(err, existingUser) {
    
                // if there are any errors, return the error
                if (err){
                    req.flash('addUserError', 'Oops! Something went wrong.');
                    res.redirect('/manageUsers');
                    return;    
                }
    
                // check to see if there's already a user with that email
                if (existingUser) {
                    req.flash('addUserError', 'That username is already taken.');
                    res.redirect('/manageUsers');
                    return;    
                }
    
                // create the user
                var newUser = new Users();
    
                newUser.username = req.body.username;
                newUser.password = newUser.generateHash(req.body.password);
                newUser.name = req.body.name;
                newUser.number = req.body.mobile_number;
                newUser.isAdmin = false;
    
                newUser.save(function(err) {
                    if (err) {
                        req.flash('addUserError', 'Oops! Something went wrong.');
                        res.redirect('/manageUsers');
                        return;   
                    }
                    req.flash('addUserSuccess', 'User added successfully.');
                    res.redirect('/manageUsers');
                    return; 
                });
            });
        });
    },
    
    // =========================================================================
    // Edit User ===============================================================
    // =========================================================================
    
    editUser: function(req, res, successRedirect) {
        // asynchronous
        process.nextTick(function() {
    
            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            Users.findOne({'username': req.body.username}, function(err, existingUser) {
    
                // if there are any errors, return the error
                if (err) {
                    req.flash('editUserError', 'Oops! Something went wrong.');
                    res.redirect(successRedirect);
                    return;    
                }
    
                existingUser.password = existingUser.generateHash(req.body.password);
                existingUser.name = req.body.name;
                existingUser.number = req.body.mobile_number;
                    
                existingUser.save(function(err, editedUser) {
                    if (err) {
                        req.flash('editUserError', 'Oops! Something went wrong.');
                        res.redirect(successRedirect);
                        return;    
                    }
                    req.flash('editUserSuccess', 'Information edited successfully.');
                    res.redirect(successRedirect);
                    return;    
                });
            });
        });
    },

    // =========================================================================
    // Remove user =============================================================
    // ========================================================================= 
    
    removeUser: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {
    
            if(req.body.username == 'admin') {
                req.flash('removeUserError', 'Cannot remove admin.');
                res.redirect('/manageUsers');
                return;                  
            }
            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            Users.remove({'username': req.body.username}, function(err) {
    
                // if there are any errors, return the error
                if (err){
                    req.flash('removeUserError', 'Oops! Something went wrong.');
                    res.redirect('/manageUsers');
                    return;                
                }
                req.flash('removeUserSuccess', 'User removed successfully.');
                res.redirect('/manageUsers');
                return;
            });
        });
    },

    // =========================================================================
    // Add service =============================================================
    // =========================================================================

    addService: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {
    
            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            Services.findOne({'name': req.body.name}, function(err, existingService) {
    
                // if there are any errors, return the error
                if (err){
                    req.flash('addServiceError', 'Oops! Something went wrong.');
                    res.redirect('/manageServices');
                    return;                
                }
    
    
                // check to see if there's already a user with that email
                if (existingService) {
                    req.flash('addServiceError', 'That name is already taken.');
                    res.redirect('/manageServices');
                    return;
                }
    
                // create the user
                var newService = new Services();
    
                newService.name = req.body.name;
                newService.price = req.body.price;
    
                newService.save(function(err) {
                    if (err) {
                        req.flash('addServiceError', 'Oops! Something went wrong.');
                        res.redirect('/manageServices');
                        return;
                    }         
                    req.flash('addServiceSuccess', 'Service added successfully.');
                    res.redirect('/manageServices');
                    return;
                });
            });
        });
    },


    // =========================================================================
    // Edit service ============================================================
    // =========================================================================

    editService: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {
    
            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            Services.findOne({'name': req.body.oldName}, function(err, existingService) {
    
                // if there are any errors, return the error
                if (err){
                    req.flash('editServiceError', 'Oops! Something went wrong.');
                    res.redirect('/manageServices');
                    return;                
                }
    
                existingService.name = req.body.name;
                existingService.price = req.body.price;
    
                existingService.save(function(err) {
                    if (err) {
                        req.flash('editServiceError', 'Oops! Something went wrong.');
                        res.redirect('/manageServices');
                        return;
                    }         
                    req.flash('editServiceSuccess', 'Service edited successfully.');
                    res.redirect('/manageServices');
                    return;
                });
            });
        });
    },   
    
    // =========================================================================
    // Remove service ==========================================================
    // ========================================================================= 
    
    removeService: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {
    
            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            Services.remove({'name': req.body.name}, function(err) {
    
                // if there are any errors, return the error
                if (err){
                    req.flash('removeServiceError', 'Oops! Something went wrong.');
                    res.redirect('/manageServices');
                    return;                
                }
        
                req.flash('removeServiceSuccess', 'Service removed successfully.');
                res.redirect('/manageServices');
                return;
            });
        });
    },

    // =========================================================================
    // Add transaction and patient =============================================
    // =========================================================================

    addTransactionAndPatient: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {

            var newPatient = new Patients();

            newPatient.first_name = req.body.first_name;
            newPatient.last_name = req.body.last_name;
            newPatient.city = req.body.city;
            newPatient.number = req.body.mobile_number; 
            newPatient.age = req.body.age; 
            newPatient.gender = req.body.gender; 
            newPatient.dob = req.body.dob; 

            newPatient.save(function(err, patient) {
                if (err) {
                    req.flash('addTransactionAndPatientError', 'Oops! Something went wrong.');
                    res.redirect('/receptionDesk');
                    return;
                }
                // Save transaction  

                var newTransaction = new Transactions();
                newTransaction.customer_number = patient._id;
                newTransaction.service = req.body.service;
                var rightNow = new Date();
                newTransaction.date = rightNow.toISOString().slice(0,10).replace(/-/g,"/");

                newTransaction.save(function(err, transaction){
                    if (err) {
                        req.flash('addTransactionAndPatientError', 'Oops! Something went wrong.');
                        res.redirect('/receptionDesk');
                        return;
                    }

                    req.flash('addTransactionAndPatientSuccess', 'Success! Customer Number: ' + patient._id + ' Transaction Number: ' + transaction._id + '.');
                    res.redirect('/receptionDesk');
                    return;
                });                
            });
        });
    },

    // =========================================================================
    // Add transaction =========================================================
    // =========================================================================

    addTransaction: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {

            Patients.findOne({ '_id' : req.body.customer_number }, function(err, patient){
                
                if (err) {
                    req.flash('addTransactionError', 'Oops! Something went wrong.');
                    res.redirect('/receptionDesk');
                    return;
                }

                if (!patient) {
                    req.flash('addTransactionError', 'Customer number is invalid.');
                    res.redirect('/receptionDesk');
                    return;
                }

                // Save transaction  
    
                var newTransaction = new Transactions();
                newTransaction.customer_number = req.body.customer_number;
                newTransaction.service = req.body.service;
                var rightNow = new Date();
                newTransaction.date = rightNow.toISOString().slice(0,10).replace(/-/g,"/");
    
                newTransaction.save(function(err, transaction){
                    if (err) {
                        req.flash('addTransactionError', 'Oops! Something went wrong.');
                        res.redirect('/receptionDesk');
                        return;
                    }
    
                    req.flash('addTransactionSuccess', 'Success! Customer Number: ' + req.body.customer_number + ', Transaction Number: ' + transaction._id + '.');
                    res.redirect('/receptionDesk');
                    return;
                });  
            });      
        });
    }
}

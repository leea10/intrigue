var User = require("./../schema-compiled.js").User;
var bcrypt = require("bcrypt");
var config = require("config");
var saltRounds = config.get("saltRounds");

/**
 * Function to validate user registration inputs
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 */
function validateInputs(req){
    if(!req.body.name || req.body.name == ""){
        req.session.message = "Please enter a valid name";
        return false;
    }
    if(!req.body.password || req.body.password == ""){
        req.session.message = "Please enter a valid password";
        return false;
    }
    var email_pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var email_valid = email_pattern.test(req.body.email);
    if(!email_valid){
        req.session.message = "Please enter a valid email address";
        return false;
    }
    return true;
}

/**
 * Backend endpoint for registering a user
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.register = function(req, res) {
    if(!validateInputs(req)){
        res.redirect("/");
        return;
    }
    var name = req.body.name;
    var password = req.body.password;
    var email = req.body.email;
    User.find({email : email}, function(err, docs){
        if(docs.length){
            req.session.loggedin = false;
            req.session.message = "A user with email: " + email + " already exists!";
            res.redirect("/");
        } else {
            bcrypt.hash(password, saltRounds, function(err, hash) {
                User.create({name : name, password : hash, email : email}, function(err){
                    if(err){
                        req.session.loggedin = false;
                        res.redirect("/");
                    } else {
                        console.log("Added user " + email + " with password " + password + " hashed as "  + hash);
                        req.session.loggedin = true;
                        req.session.name = name;
                        req.session.id = docs._id;
                        res.redirect("/dashboard");
                    }
                });
            });
        }
    });
};

/**
 * Backend endpoint for logging a user in
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.login = function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    console.log("Attempting to find user " + email + " with password " + password);
    User.findOne({email : email} , "name password", function(err, person){
        if(err){
            req.session.loggedin = false;
            req.session.message = "An error occurred logging you in";
            res.redirect("/");
        } else if(person != null){
            bcrypt.compare(password, person.password, function(err, valid){
                if(valid){
                    req.session.loggedin = true;
                    req.session.name = person.name;
                    req.session.uid = person._id;
                    req.session.message = "You have been successfully logged in!";
                    res.redirect("/dashboard");
                } else {
                    req.session.loggedin = false;
                    req.session.message = "Invalid username or password!";
                    res.redirect("/");
                }
            });
        } else {
            req.session.loggedin = false;
            req.session.message = "Invalid username or password!";
            res.redirect("/");
        }
    });
};

/**
 * Backend endpoint for logging a user out
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.logout = function(req, res){
    req.session.loggedin = false;
    req.session.message = "You have been logged out!";
    res.redirect("/");
};

/**
 * Backend endpoint for validating a users session
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 * @param {function} next
 *   The next middleware function in the sequence
 */
exports.isLoggedIn = function(req, res, next){
    if(req.session.loggedin){
        next();
    } else {
        res.redirect("/");
    }
};

/**
 * Function which redirects a user to the dashboard from the index if they are
 * already logged in.
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 * @param {function} next
 *   The next middleware function in the sequence
 */
exports.indexRedirect = function(req,res,next){
    if(req.session.loggedin){
        if(req.session.loggedin == true)
            res.redirect("/dashboard");
    } else {
        next();
    }
};
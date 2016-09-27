var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name : String,
    email : { type : String, unique : true, required : true },
    password : {type : String, required : true }
});

var User = mongoose.model("User",UserSchema);

module.exports = {
    User : User
};

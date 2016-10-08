require('should');
require('should-http');
var assert = require('assert');
var request = require('supertest');
var server;
var schema;
before(function(done){
    server = require('./../server');
    schema = require("./../app/schema-compiled");
    schema.User.remove({email : "dowde@rpi.edu"},function(){
        schema.Story.remove({title : "Test Title"},done);
    });
});

describe("Authentication", function(){

    it("should successfully create a new user", function(done){
       var user = {
           name : "Ezra Dowd",
           password : "Vroomvroom",
           email : "dowde@rpi.edu"
       };
       request(server)
           .post('/register')
           .send(user)
           .end(function(err, res){
               if(err)
                   throw err;
               res.should.have.status(302);
               res.should.have.header("location", "/dashboard");
               done();
           });
    });

    it("should successfully login an existing user", function(done){
        var user = {
            password : "Vroomvroom",
            email : "dowde@rpi.edu"
        };
        request(server)
            .post('/login')
            .send(user)
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(302);
                res.should.have.header("location", "/dashboard");
                done();
            });
    });

    it("should fail to login an non-existent user", function(done){
        var user = {
            password : "Vroomvroom",
            email : "notarealuser@rpi.edu"
        };
        request(server)
            .post('/login')
            .send(user)
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(302);
                res.should.have.header("location", "/");
                done();
            });
    });

    it("should fail to create a duplicate user", function(done){
        var user = {
            name : "Ezra Dowd",
            password : "Vroomvroom",
            email : "dowde@rpi.edu"
        };
        request(server)
            .post('/register')
            .send(user)
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(302);
                res.should.have.header("location", "/");
                done();
            });
    });

    it("should fail to create a user with an invalid email", function(done){
        var user = {
            name : "Ezra Dowd",
            password : "Vroomvroom",
            email : "not an email"
        };
        request(server)
            .post('/register')
            .send(user)
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(302);
                res.should.have.header("location", "/");
                done();
            });
    });

    it("should fail to create a user with an blank name", function(done){
        var user = {
            name : "",
            password : "Vroomvroom",
            email : "blankname@rpi.edu"
        };
        request(server)
            .post('/register')
            .send(user)
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(302);
                res.should.have.header("location", "/");
                done();
            });
    });

    it("should fail to create a user with an blank password", function(done){
        var user = {
            name : "Blank Password",
            password : "",
            email : "blankpassword@rpi.edu"
        };
        request(server)
            .post('/register')
            .send(user)
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(302);
                res.should.have.header("location", "/");
                done();
            });
    });
});

describe("API", function(){
    var sessionCookie;

    it("should successfully login an existing user", function(done){
        var user = {
            password : "Vroomvroom",
            email : "dowde@rpi.edu"
        };
        request(server)
            .post('/login')
            .send(user)
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(302);
                res.should.have.header("location", "/dashboard");
                sessionCookie = res.headers['set-cookie'].pop().split(';')[0];
                done();
            });
    });

    var container = {
        storyObj: {
            title: "Test Title",
            description: "Test Description",
            image: "Test Image"
        }
    };

    it("should successfully save a new story", function(done){
        request(server)
            .post('/saveStory')
            .send(container)
            .set('Cookie', [sessionCookie])
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.property('data');
                res.body.data.should.have.property('_id');
                res.body.data.title.should.equal(container.storyObj.title);
                res.body.data.description.should.equal(container.storyObj.description);
                container.storyObj._id = res.body.data._id;
                done();
            });
    });

    it("should successfully update a saved story", function(done){
        container.storyObj.description = "New Test Description";
        request(server)
            .post('/saveStory')
            .send(container)
            .set('Cookie', [sessionCookie])
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.property('data');
                res.body.data.should.have.property('nModified');
                res.body.data.nModified.should.equal(1);
                done();
            });
    });

});
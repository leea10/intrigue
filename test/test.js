require('should');
require('should-http');
var assert = require('assert');
var request = require('supertest');
process.env.NODE_ENV = 'test';

//TODO do something to create a seperate test intance
//TODO TESTS SHOULD NOT DEPEND ON OTHER TESTS

var server = require('./../server');
var schema = require("./../app/schema");

describe("Authentication", function(){

    beforeEach(function (done) {
        schema.User.remove({}, function(){
            done();
        });
    });

    it("should successfully create a new user", function(done){
        var user = {
            name : "Ezra Dowd",
            password : "Vroomvroom",
            email : "testuser@rpi.edu"
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
            name : "Ezra Dowd",
            password : "Vroomvroom",
            email : "testuser@rpi.edu"
        };
        request(server)
            .post('/register')
            .send(user)
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(302);
                res.should.have.header("location", "/dashboard");
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
            email : "testuser@rpi.edu"
        };
        request(server)
            .post('/register')
            .send(user)
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(302);
                res.should.have.header("location", "/dashboard");
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

    let sessionCookie;
    let user;

    before(function(done){
        schema.User.remove({}, function(){
            var user = {
                name : "Ezra Dowd",
                password : "Vroomvroom",
                email : "testuser@rpi.edu"
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function(err, res){
                    if(err)
                        throw err;
                    sessionCookie = res.headers['set-cookie'].pop().split(';')[0];
                    done();
                });
        });
    });

    var storyContainer = {
        storyObj: {
            title: "Test Title",
            description: "Test Description",
            image: "Test Image"
        }
    };

    it("should successfully save a new story", function(done){
        request(server)
            .post('/saveStory')
            .send(storyContainer)
            .set('Cookie', [sessionCookie])
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.property('data');
                res.body.data.should.have.property('_id');
                res.body.data.title.should.equal(storyContainer.storyObj.title);
                res.body.data.description.should.equal(storyContainer.storyObj.description);
                storyContainer.storyObj._id = res.body.data._id;
                done();
            });
    });

    it("should successfully update a saved story", function(done){
        storyContainer.storyObj.description = "New Test Description";
        request(server)
            .post('/saveStory')
            .send(storyContainer)
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

    var characterContainer = {
        characterObj : {
            name: "Test Character",
            age: 1,
            description: "Test Character Description",
            history : "Test Character History",
            personality : "Test Character Personality",
            story : storyContainer.storyObj._id,
            tags: []
        }
    };

    it("should successfully add a character to an existing story", function(done){
        request(server)
            .post('/saveCharacter')
            .send(characterContainer)
            .set('Cookie', [sessionCookie])
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.property('data');
                res.body.data.should.have.property('_id');
                res.body.data.name.should.equal(characterContainer.characterObj.name);
                res.body.data.description.should.equal(characterContainer.characterObj.description);
                characterContainer.characterObj._id = res.body.data._id;
                done();
            });
    });

    it("should successfully update an existing character", function(done){
        characterContainer.characterObj.description = "New Character Description";
        request(server)
            .post('/saveCharacter')
            .send(characterContainer)
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

    var snapshotContainer = {
        snapshotObj : {
            story : storyContainer.storyObj._id,
            label : "Test Snapshot Label"
        }
    };

    it("should successfully create a new snapshot", function(done){
        request(server)
            .post('/saveSnapshot')
            .send(snapshotContainer)
            .set('Cookie', [sessionCookie])
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.property('data');
                res.body.data.should.have.property('_id');
                res.body.data.label.should.equal(snapshotContainer.snapshotObj.label);
                snapshotContainer.snapshotObj._id = res.body.data._id;
                done();
            });
    });

    it("should successfully update an existing snapshot", function(done){
        snapshotContainer.snapshotObj.label = "New Snapshot Label";
        request(server)
            .post('/saveSnapshot')
            .send(snapshotContainer)
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

    var nodeContainer = {
        nodeObj : {
            snapshot : snapshotContainer.snapshotObj._id,
            character : characterContainer.characterObj._id,
            x : 15,
            y : 15
        }
    };

    it("should successfully create a new node", function(done){
        request(server)
            .post('/saveNode')
            .send(nodeContainer)
            .set('Cookie', [sessionCookie])
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.property('data');
                res.body.data.should.have.property('_id');
                res.body.data.x.should.equal(nodeContainer.nodeObj.x);
                res.body.data.y.should.equal(nodeContainer.nodeObj.y);
                nodeContainer.nodeObj._id = res.body.data._id;
                done();
            });
    });

    it("should successfully update an existing node", function(done){
        nodeContainer.nodeObj.x = 30;
        request(server)
            .post('/saveNode')
            .send(nodeContainer)
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

    it("should get all stories for logged in user", function(done){
        request(server)
            .get('/getStories')
            .set('Cookie', [sessionCookie])
            .end(function(err, res){
                if(err)
                    throw err;
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.property('data');
                res.body.data.length.should.equal(1);
                done();
            });
    });

    var getStoryDetailsQuery = {
        storyID : storyContainer.storyObj._id
    };

    it("should get detailed information for an existing story", function(done){
       request(server)
           .get('/getStoryDetails')
           .set('Cookie', [sessionCookie])
           .send(getStoryDetailsQuery)
           .end(function(err, res){
               if(err)
                   throw err;
               res.should.have.status(200);
               res.should.be.json;
               res.body.should.have.property('data');
               done();
           });
    });

});
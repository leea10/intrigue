require('should');
require('should-http');
const mongoose = require('mongoose');
const assert = require('assert');
const request = require('supertest');
const server = require('./../server');
const schema = require("./../app/schema");

process.env.NODE_ENV = 'test';

describe("General Tests", function(){
    describe("Authentication", function () {

        beforeEach(function (done) {
            schema.User.remove({}, function () {
                done();
            });
        });

        it("should successfully create a new user", function (done) {
            var user = {
                name: "Ezra Dowd",
                password: "Vroomvroom",
                email: "testuser@rpi.edu"
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header("location", "/dashboard");
                    done();
                });
        });

        it("should successfully login an existing user", function (done) {
            var user = {
                name: "Ezra Dowd",
                password: "Vroomvroom",
                email: "testuser@rpi.edu"
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header("location", "/dashboard");
                    request(server)
                        .post('/login')
                        .send(user)
                        .end(function (err, res) {
                            if (err)
                                throw err;
                            res.should.have.status(302);
                            res.should.have.header("location", "/dashboard");
                            done();
                        });
                });
        });


        it("should fail to login an non-existent user", function (done) {
            var user = {
                password: "Vroomvroom",
                email: "notarealuser@rpi.edu"
            };
            request(server)
                .post('/login')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header("location", "/");
                    done();
                });
        });

        it("should fail to create a duplicate user", function (done) {
            var user = {
                name: "Ezra Dowd",
                password: "Vroomvroom",
                email: "testuser@rpi.edu"
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header("location", "/dashboard");
                    request(server)
                        .post('/register')
                        .send(user)
                        .end(function (err, res) {
                            if (err)
                                throw err;
                            res.should.have.status(302);
                            res.should.have.header("location", "/");
                            done();
                        });
                });
        });

        it("should fail to create a user with an invalid email", function (done) {
            var user = {
                name: "Ezra Dowd",
                password: "Vroomvroom",
                email: "not an email"
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header("location", "/");
                    done();
                });
        });

        it("should fail to create a user with an blank name", function (done) {
            var user = {
                name: "",
                password: "Vroomvroom",
                email: "blankname@rpi.edu"
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header("location", "/");
                    done();
                });
        });

        it("should fail to create a user with an blank password", function (done) {
            var user = {
                name: "Blank Password",
                password: "",
                email: "blankpassword@rpi.edu"
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header("location", "/");
                    done();
                });
        });
    });

    describe("API", function () {

        let sessionCookie;
        let user_id;

        before(function (done) {
            schema.User.remove({}, function () {
                let user = {
                    name: "Ezra Dowd",
                    password: "Vroomvroom",
                    email: "testuser@rpi.edu"
                };
                request(server)
                    .post('/register')
                    .send(user)
                    .end(function (err, res) {
                        if (err)
                            throw err;
                        sessionCookie = res.headers['set-cookie'].pop().split(';')[0];
                        schema.User.findOne({email: user.email}, "_id", function (err, doc) {
                            if (err)
                                throw err;
                            user_id = doc._id;
                            done();
                        });
                    });
            });
        });

        beforeEach(function (done) {
            schema.Story.remove({}, function () {
                done();
            })
        });

        it("should successfully save a new story", function (done) {
            let storyContainer = {
                storyObj: {
                    title: "Test Title",
                    description: "Test Description",
                    image: "Test Image"
                }
            };
            request(server)
                .post('/saveStory')
                .send(storyContainer)
                .set('Cookie', [sessionCookie])
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('_id');
                    res.body.data.title.should.equal(storyContainer.storyObj.title);
                    res.body.data.description.should.equal(storyContainer.storyObj.description);
                    done();
                });
        });

        it("should successfully update a saved story", function (done) {
            let storyContainer = {
                storyObj: {
                    title: "Test Title",
                    description: "Test Description",
                    image: "Test Image"
                }
            };
            schema.Story.create({
                author: user_id,
                title: storyContainer.storyObj.title,
                description: storyContainer.storyObj.description,
                image: storyContainer.storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                storyContainer.storyObj.description = "New Test Description";
                storyContainer.storyObj._id = rObj._id;
                request(server)
                    .post('/saveStory')
                    .send(storyContainer)
                    .set('Cookie', [sessionCookie])
                    .end(function (err, res) {
                        if (err)
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

        it("should successfully add a character to an existing story", function (done) {
            let storyContainer = {
                storyObj: {
                    title: "Test Title",
                    description: "Test Description",
                    image: "Test Image"
                }
            };
            schema.Story.create({
                author: user_id,
                title: storyContainer.storyObj.title,
                description: storyContainer.storyObj.description,
                image: storyContainer.storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                let characterContainer = {
                    characterObj: {
                        name: "Test Character",
                        age: 1,
                        description: "Test Character Description",
                        history: "Test Character History",
                        personality: "Test Character Personality",
                        story: rObj._id,
                        tags: []
                    }
                };
                request(server)
                    .post('/saveCharacter')
                    .send(characterContainer)
                    .set('Cookie', [sessionCookie])
                    .end(function (err, res) {
                        if (err)
                            throw err;
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.have.property('data');
                        res.body.data.should.have.property('_id');
                        res.body.data.name.should.equal(characterContainer.characterObj.name);
                        res.body.data.description.should.equal(characterContainer.characterObj.description);
                        done();
                    });
            });
        });

        it("should successfully update an existing character", function (done) {
            let storyContainer = {
                storyObj: {
                    title: "Test Title",
                    description: "Test Description",
                    image: "Test Image"
                }
            };
            schema.Story.create({
                author: user_id,
                title: storyContainer.storyObj.title,
                description: storyContainer.storyObj.description,
                image: storyContainer.storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                storyContainer.storyObj._id = rObj._id;
                let characterContainer = {
                    characterObj: {
                        name: "Test Character",
                        age: 1,
                        description: "Test Character Description",
                        history: "Test Character History",
                        personality: "Test Character Personality",
                        story: rObj._id,
                        tags: []
                    }
                };
                schema.Character.create(characterContainer.characterObj, function (err, cObj) {
                    if (err)
                        throw err;
                    characterContainer.characterObj._id = cObj._id;
                    characterContainer.characterObj.description = "New Test Character Description";
                    request(server)
                        .post('/saveCharacter')
                        .send(characterContainer)
                        .set('Cookie', [sessionCookie])
                        .end(function (err, res) {
                            if (err)
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
        });

        it("should successfully create a new snapshot", function (done) {
            let storyContainer = {
                storyObj: {
                    title: "Test Title",
                    description: "Test Description",
                    image: "Test Image"
                }
            };
            schema.Story.create({
                author: user_id,
                title: storyContainer.storyObj.title,
                description: storyContainer.storyObj.description,
                image: storyContainer.storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                storyContainer.storyObj._id = rObj._id
                let snapshotContainer = {
                    snapshotObj: {
                        story: rObj._id,
                        label: "Test Snapshot Label"
                    }
                };
                request(server)
                    .post('/saveSnapshot')
                    .send(snapshotContainer)
                    .set('Cookie', [sessionCookie])
                    .end(function (err, res) {
                        if (err)
                            throw err;
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.have.property('data');
                        res.body.data.should.have.property('_id');
                        res.body.data.label.should.equal(snapshotContainer.snapshotObj.label);
                        done();
                    });
            });
        });

        it("should successfully update an existing snapshot", function (done) {
            let storyContainer = {
                storyObj: {
                    title: "Test Title",
                    description: "Test Description",
                    image: "Test Image"
                }
            };
            schema.Story.create({
                author: user_id,
                title: storyContainer.storyObj.title,
                description: storyContainer.storyObj.description,
                image: storyContainer.storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                let snapshotContainer = {
                    snapshotObj: {
                        story: rObj._id,
                        label: "Test Snapshot Label"
                    }
                };
                schema.Snapshot.create(snapshotContainer.snapshotObj, function (err, sObj) {
                    snapshotContainer.snapshotObj._id = sObj._id;
                    snapshotContainer.snapshotObj.label = "New Snapshot Label";
                    request(server)
                        .post('/saveSnapshot')
                        .send(snapshotContainer)
                        .set('Cookie', [sessionCookie])
                        .end(function (err, res) {
                            if (err)
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

        });

        it("should successfully create a new node", function (done) {
            let storyContainer = {
                storyObj: {
                    title: "Test Title",
                    description: "Test Description",
                    image: "Test Image"
                }
            };
            schema.Story.create({
                author: user_id,
                title: storyContainer.storyObj.title,
                description: storyContainer.storyObj.description,
                image: storyContainer.storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                let snapshotContainer = {
                    snapshotObj: {
                        story: rObj._id,
                        label: "Test Snapshot Label"
                    }
                };
                let characterContainer = {
                    characterObj: {
                        name: "Test Character",
                        age: 1,
                        description: "Test Character Description",
                        history: "Test Character History",
                        personality: "Test Character Personality",
                        story: rObj._id,
                        tags: []
                    }
                };
                schema.Character.create(characterContainer.characterObj, function(err, cObj) {
                    if (err)
                        throw err;
                    characterContainer.characterObj._id = cObj._id;
                    schema.Snapshot.create(snapshotContainer.snapshotObj, function (err, sObj) {
                        snapshotContainer.snapshotObj._id = sObj._id;
                        let nodeContainer = {
                            nodeObj: {
                                snapshot: snapshotContainer.snapshotObj._id,
                                character: characterContainer.characterObj._id,
                                x: 15,
                                y: 15
                            }
                        };
                        request(server)
                            .post('/saveNode')
                            .send(nodeContainer)
                            .set('Cookie', [sessionCookie])
                            .end(function (err, res) {
                                if (err)
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
                });
            });
        });

        it("should successfully update an existing node", function (done) {
            let storyContainer = {
                storyObj: {
                    title: "Test Title",
                    description: "Test Description",
                    image: "Test Image"
                }
            };
            schema.Story.create({
                author: user_id,
                title: storyContainer.storyObj.title,
                description: storyContainer.storyObj.description,
                image: storyContainer.storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                let snapshotContainer = {
                    snapshotObj: {
                        story: rObj._id,
                        label: "Test Snapshot Label"
                    }
                };
                let characterContainer = {
                    characterObj: {
                        name: "Test Character",
                        age: 1,
                        description: "Test Character Description",
                        history: "Test Character History",
                        personality: "Test Character Personality",
                        story: rObj._id,
                        tags: []
                    }
                };
                schema.Character.create(characterContainer.characterObj, function(err, cObj){
                    if(err)
                        throw err;
                    characterContainer.characterObj._id = cObj._id;
                    schema.Snapshot.create(snapshotContainer.snapshotObj, function (err, sObj) {
                        if(err)
                            throw err;
                        snapshotContainer.snapshotObj._id = sObj._id;
                        let nodeContainer = {
                            nodeObj: {
                                snapshot: snapshotContainer.snapshotObj._id,
                                character: characterContainer.characterObj._id,
                                x: 15,
                                y: 15
                            }
                        };
                        schema.Node.create(nodeContainer.nodeObj, function (err, nObj){
                            if(err)
                                throw err;
                            nodeContainer.nodeObj._id = nObj._id;
                            nodeContainer.nodeObj.x = 14;
                            request(server)
                                .post('/saveNode')
                                .send(nodeContainer)
                                .set('Cookie', [sessionCookie])
                                .end(function (err, res) {
                                    if (err)
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
                });
            });
        });

        it("should get all stories for logged in user", function (done) {
            request(server)
                .get('/getStories')
                .set('Cookie', [sessionCookie])
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property('data');
                    res.body.data.length.should.equal(0);
                    done();
                });
        });

        var getStoryDetailsQuery = {
            storyID: 1
        };

        it("should get detailed information for an existing story", function (done) {
            request(server)
                .get('/getStoryDetails')
                .set('Cookie', [sessionCookie])
                .send(getStoryDetailsQuery)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property('data');
                    done();
                });
        });

    });

    after(function(done){
        mongoose.connection.db.dropDatabase();
        done();
    });
});
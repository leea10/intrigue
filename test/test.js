require('should');
require('should-http');
const mongoose = require('mongoose');
const assert = require('assert');
const request = require('supertest');
const server = require('./../server');
const schema = require('./../app/schema');

process.env.NODE_ENV = 'test';

describe('Endpoint Testing', function () {
    describe('Authentication', function () {

        beforeEach(function (done) {
            schema.User.remove({}, function () {
                done();
            });
        });

        it('should successfully create a new user', function (done) {
            let user = {
                name: 'Ezra Dowd',
                password: 'Vroomvroom',
                email: 'testuser@rpi.edu'
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header('location', '/dashboard');
                    done();
                });
        });

        it('should successfully login an existing user', function (done) {
            let user = {
                name: 'Ezra Dowd',
                password: 'Vroomvroom',
                email: 'testuser@rpi.edu'
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header('location', '/dashboard');
                    request(server)
                        .post('/login')
                        .send(user)
                        .end(function (err, res) {
                            if (err)
                                throw err;
                            res.should.have.status(302);
                            res.should.have.header('location', '/dashboard');
                            done();
                        });
                });
        });


        it('should fail to login an non-existent user', function (done) {
            let user = {
                password: 'Vroomvroom',
                email: 'notarealuser@rpi.edu'
            };
            request(server)
                .post('/login')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header('location', '/');
                    done();
                });
        });

        it('should fail to create a duplicate user', function (done) {
            let user = {
                name: 'Ezra Dowd',
                password: 'Vroomvroom',
                email: 'testuser@rpi.edu'
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header('location', '/dashboard');
                    request(server)
                        .post('/register')
                        .send(user)
                        .end(function (err, res) {
                            if (err)
                                throw err;
                            res.should.have.status(302);
                            res.should.have.header('location', '/');
                            done();
                        });
                });
        });

        it('should fail to create a user with an invalid email', function (done) {
            let user = {
                name: 'Ezra Dowd',
                password: 'Vroomvroom',
                email: 'not an email'
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header('location', '/');
                    done();
                });
        });

        it('should fail to create a user with an blank name', function (done) {
            let user = {
                name: '',
                password: 'Vroomvroom',
                email: 'blankname@rpi.edu'
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header('location', '/');
                    done();
                });
        });

        it('should fail to create a user with an blank password', function (done) {
            let user = {
                name: 'Blank Password',
                password: '',
                email: 'blankpassword@rpi.edu'
            };
            request(server)
                .post('/register')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(302);
                    res.should.have.header('location', '/');
                    done();
                });
        });
    });

    describe('API', function () {

        let sessionCookie;
        let user_id;

        before(function (done) {
            schema.User.remove({}, function () {
                let user = {
                    name: 'Ezra Dowd',
                    password: 'Vroomvroom',
                    email: 'testuser@rpi.edu'
                };
                request(server)
                    .post('/register')
                    .send(user)
                    .end(function (err, res) {
                        if (err)
                            throw err;
                        sessionCookie = res.headers['set-cookie'].pop().split(';')[0];
                        schema.User.findOne({email: user.email}, '_id', function (err, doc) {
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

        it('should successfully save a new story', function (done) {
            let storyObj = {
                title: 'Test Title',
                description: 'Test Description',
                image: 'Test Image'
            };
            request(server)
                .post('/api/story')
                .send(storyObj)
                .set('Cookie', [sessionCookie])
                .end(function (err, res) {
                    if (err)
                        throw err;
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('_id');
                    res.body.data.title.should.equal(storyObj.title);
                    res.body.data.description.should.equal(storyObj.description);
                    done();
                });
        });

        it('should successfully update a saved story', function (done) {
            let storyObj = {
                title: 'Test Title',
                description: 'Test Description',
                image: 'Test Image'
            };
            schema.Story.create({
                author: user_id,
                title: storyObj.title,
                description: storyObj.description,
                image: storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                storyObj.description = 'New Test Description';
                storyObj._id = rObj._id;
                request(server)
                    .put('/api/story')
                    .send(storyObj)
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

        it('should fail to update a non-owned story', function (done) {
            let storyObj = {
                title: 'Test Title',
                description: 'Test Description',
                image: 'Test Image'
            };
            schema.Story.create({
                author: '11111373e894ad11111efe01',
                title: storyObj.title,
                description: storyObj.description,
                image: storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                storyObj.description = 'New Test Description';
                storyObj._id = rObj._id;
                request(server)
                    .put('/api/story')
                    .send(storyObj)
                    .set('Cookie', [sessionCookie])
                    .end(function (err, res) {
                        if (err)
                            throw err;
                        res.should.have.status(500);
                        res.should.be.json;
                        done();
                    });
            });
        });

        it('should successfully add a character to an existing story', function (done) {
            let storyObj = {
                title: 'Test Title',
                description: 'Test Description',
                image: 'Test Image'
            };
            schema.Story.create({
                author: user_id,
                title: storyObj.title,
                description: storyObj.description,
                image: storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                let characterObj = {
                    name: 'Test Character',
                    age: 1,
                    description: 'Test Character Description',
                    history: 'Test Character History',
                    personality: 'Test Character Personality',
                    story: rObj._id,
                    tags: []
                };
                request(server)
                    .post('/api/character')
                    .send(characterObj)
                    .set('Cookie', [sessionCookie])
                    .end(function (err, res) {
                        if (err)
                            throw err;
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.have.property('data');
                        res.body.data.should.have.property('_id');
                        res.body.data.name.should.equal(characterObj.name);
                        res.body.data.description.should.equal(characterObj.description);
                        done();
                    });
            });
        });

        it('should successfully update an existing character', function (done) {
            let storyObj = {
                title: 'Test Title',
                description: 'Test Description',
                image: 'Test Image'
            };
            schema.Story.create({
                author: user_id,
                title: storyObj.title,
                description: storyObj.description,
                image: storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                storyObj._id = rObj._id;
                let characterObj = {
                    owner : user_id,
                    name: 'Test Character',
                    age: 1,
                    description: 'Test Character Description',
                    history: 'Test Character History',
                    personality: 'Test Character Personality',
                    story: rObj._id,
                    tags: []
                };
                schema.Character.create(characterObj, function (err, cObj) {
                    if (err)
                        throw err;
                    characterObj._id = cObj._id;
                    characterObj.description = 'New Test Character Description';
                    request(server)
                        .put('/api/character')
                        .send(characterObj)
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

        it('should successfully create a new snapshot', function (done) {
            let storyObj = {
                title: 'Test Title',
                description: 'Test Description',
                image: 'Test Image'
            };
            schema.Story.create({
                author: user_id,
                title: storyObj.title,
                description: storyObj.description,
                image: storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                storyObj._id = rObj._id;
                let snapshotObj = {
                    owner : user_id,
                    story: rObj._id,
                    label: 'Test Snapshot Label'
                };
                request(server)
                    .post('/api/snapshot')
                    .send(snapshotObj)
                    .set('Cookie', [sessionCookie])
                    .end(function (err, res) {
                        if (err)
                            throw err;
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.have.property('data');
                        res.body.data.should.have.property('_id');
                        res.body.data.label.should.equal(snapshotObj.label);
                        done();
                    });
            });
        });

        it('should successfully update an existing snapshot', function (done) {
            let storyObj = {
                title: 'Test Title',
                description: 'Test Description',
                image: 'Test Image'
            };
            schema.Story.create({
                author: user_id,
                title: storyObj.title,
                description: storyObj.description,
                image: storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                let snapshotObj = {
                    owner : user_id,
                    story: rObj._id,
                    label: 'Test Snapshot Label'
                };
                schema.Snapshot.create(snapshotObj, function (err, sObj) {
                    snapshotObj._id = sObj._id;
                    snapshotObj.label = 'New Snapshot Label';
                    request(server)
                        .put('/api/snapshot')
                        .send(snapshotObj)
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

        it('should successfully create a new node', function (done) {
            let storyObj = {
                title: 'Test Title',
                description: 'Test Description',
                image: 'Test Image'
            };
            schema.Story.create({
                author: user_id,
                title: storyObj.title,
                description: storyObj.description,
                image: storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                let snapshotObj = {
                    owner : user_id,
                    story: rObj._id,
                    label: 'Test Snapshot Label'
                };
                let characterObj = {
                    owner : user_id,
                    name: 'Test Character',
                    age: 1,
                    description: 'Test Character Description',
                    history: 'Test Character History',
                    personality: 'Test Character Personality',
                    story: rObj._id,
                    tags: []
                };
                schema.Character.create(characterObj, function (err, cObj) {
                    if (err)
                        throw err;
                    characterObj._id = cObj._id;
                    schema.Snapshot.create(snapshotObj, function (err, sObj) {
                        snapshotObj._id = sObj._id;
                        let nodeObj = {
                            owner : user_id,
                            snapshot: snapshotObj._id,
                            character: characterObj._id,
                            x: 15,
                            y: 15
                        };
                        request(server)
                            .post('/api/node')
                            .send(nodeObj)
                            .set('Cookie', [sessionCookie])
                            .end(function (err, res) {
                                if (err)
                                    throw err;
                                res.should.have.status(200);
                                res.should.be.json;
                                res.body.should.have.property('data');
                                res.body.data.should.have.property('_id');
                                res.body.data.x.should.equal(nodeObj.x);
                                res.body.data.y.should.equal(nodeObj.y);
                                nodeObj._id = res.body.data._id;
                                done();
                            });
                    });
                });
            });
        });

        it('should successfully update an existing node', function (done) {
            let storyObj = {
                title: 'Test Title',
                description: 'Test Description',
                image: 'Test Image'
            };
            schema.Story.create({
                author: user_id,
                title: storyObj.title,
                description: storyObj.description,
                image: storyObj.image,
                characters: [],
                snapshots: []
            }, function (err, rObj) {
                let snapshotObj = {
                    owner : user_id,
                    story: rObj._id,
                    label: 'Test Snapshot Label'
                };
                let characterObj = {
                    owner : user_id,
                    name: 'Test Character',
                    age: 1,
                    description: 'Test Character Description',
                    history: 'Test Character History',
                    personality: 'Test Character Personality',
                    story: rObj._id,
                    tags: []
                };
                schema.Character.create(characterObj, function (err, cObj) {
                    if (err)
                        throw err;
                    characterObj._id = cObj._id;
                    schema.Snapshot.create(snapshotObj, function (err, sObj) {
                        if (err)
                            throw err;
                        snapshotObj._id = sObj._id;
                        let nodeObj = {
                            owner : user_id,
                            snapshot: snapshotObj._id,
                            character: characterObj._id,
                            x: 15,
                            y: 15
                        };
                        schema.Node.create(nodeObj, function (err, nObj) {
                            if (err)
                                throw err;
                            nodeObj._id = nObj._id;
                            nodeObj.x = 14;
                            request(server)
                                .put('/api/node')
                                .send(nodeObj)
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

        it('should get all stories for logged in user', function (done) {
            request(server)
                .get('/api/story/owned')
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

        it('should get detailed information for an existing story', function (done) {
            let getStoryDetailsQuery = {
                storyID: 1
            };
            request(server)
                .get('/api/story/detail')
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

    after(function (done) {
        mongoose.connection.db.dropDatabase();
        done();
    });
});

describe("Model Testing", function () {

});
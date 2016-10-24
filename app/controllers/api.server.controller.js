const mongoose = require('mongoose');
const schema = require('./../schema');
const User = schema.User;
const Story = schema.Story;
const Character = schema.Character;
const Snapshot = schema.Snapshot;
const Relationship = schema.Relationship;
const Node = schema.Node;
const Tag = schema.Tag;
const OIDType = mongoose.Types.ObjectId;

let pojoify = (obj) => {
    let pojo = {};
    for(var trait in obj){
        if(obj.hasOwnProperty(trait) && trait != '_id'){
            pojo[trait] = obj[trait];
        }
    }
    return pojo;
};


/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.saveStory = (req, res) => {
    let sObj = req.body;
    if (sObj._id) {
        Story.update({_id: OIDType(sObj._id), author : req.session.uid}, {$set: pojoify(sObj)}, (err, rObj) => {
            if (err) {
                console.error(err);
                res.status(500).json({message: 'An error occurred saving the story'});
            } else {
                if(rObj.nModified === 0)
                    res.status(500).json({message: 'You are not authorized to make this change', data: rObj});
                else
                    res.json({message: 'Successfully saved the story', data: rObj});
            }
        });
    } else {
        Story.create({
            author : req.session.uid,
            title: sObj.title,
            description: sObj.description,
            image: sObj.image,
            characters: [],
            snapshots: []
        }, (err, rObj) => {
            if (err) {
                console.error(err);
                res.status(500).json({message: 'An error occurred saving the story'});
            } else {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: 'An error occurred saving the story'});
                } else {
                    res.json({message: 'Successfully saved the story', data: rObj});
                }
            }
        });
    }
};

/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.removeStory = function (req, res) {
    let id = OIDType(req.body.id);
    Story.remove({ _id : id, author : req.session.uid}, (err, num) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred removing the story'});
        } else {
            res.json({message: 'Successfully removed the story', data: num});
        }
    });
};

/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.getStories = (req, res) => {
    let userID = req.session.uid;
    Story.find({author: userID}, '_id title description', (err, docs) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred retrieving the stories'});
        } else {
            res.json({message: `Successfully retrieved ${docs.length} stories`, data: docs});
        }
    });
};

/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.getStoryDetails = function (req, res) {
    let storyID = OIDType(req.query.storyID);
    let userID = req.session.uid;
    Story.findOne({author: userID, _id: storyID}).populate('characters snapshots tags').exec((err, s1) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred retrieving the story'});
        } else {
            Character.populate(s1, {path: 'characters.tags', model: 'Tag'}, (err, s2) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: 'An error occurred retrieving the story'});
                } else {
                    Snapshot.populate(s2, {path: 'snapshots.nodes', model: 'Node'}, (err, s3) => {
                        if (err) {
                            console.error(err);
                            res.status(500).json({message: 'An error occurred retrieving the story'});
                        } else {
                            Snapshot.populate(s3, {
                                path: 'snapshots.relationships',
                                model: 'Relationship'
                            }, (err, s4) => {
                                if (err) {
                                    console.error(err);
                                    res.status(500).json({message: 'An error occurred retrieving the story'});
                                } else {
                                    res.json({message: `Successfully retrieved story data`, data: s4});
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.saveCharacter = function (req, res) {
    let cObj = req.body;
    if (cObj._id) {
        Character.update({_id: OIDType(cObj._id), owner : req.session.uid}, {$set: pojoify(cObj)}, (err, rObj) => {
            if (err) {
                console.error(err);
                res.status(500).json({message: 'An error occurred saving the character'});
            } else {
                res.json({message: 'Successfully saved the character', data: rObj});
            }
        });
    } else {
        Character.create({
            owner : req.session.uid,
            name: cObj.name,
            age: cObj.age,
            description: cObj.description,
            history : cObj.history,
            personality : cObj.personality,
            story : OIDType(cObj.story),
            tags: []
        }, (err, rObj) => {
            if (err) {
                console.error(err);
                res.status(500).json({message: 'An error occurred saving the character'});
            } else {
                res.json({message: 'Successfully saved the character', data: rObj});
            }
        });
    }
};

/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.removeCharacter = (req, res) => {
    let id = OIDType(req.body.id);
    Character.remove({_id: id, owner : req.session.uid}, (err, num) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred removing the character'});
        } else {
            res.json({message: 'Successfully removed the character', data: num});
        }
    });
};

/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.saveSnapshot = (req, res) => {
    let sObj = req.body;
    if (sObj._id) {
        Snapshot.update({_id: OIDType(sObj._id), owner : req.session.uid},{$set: pojoify(sObj)}, (err, rObj) => {
            if (err) {
                console.error(err);
                res.status(500).json({message: 'An error occurred saving the snapshot'});
            } else {
                res.json({message: 'Successfully saved the snapshot', data: rObj});
            }
        });
    } else {
        Snapshot.create({
            owner : req.session.uid,
            story: OIDType(sObj.story),
            label: sObj.label,
            nodes: [],
            relationships: []
        }, (err, rObj) => {
            if (err) {
                console.error(err);
                res.status(500).json({message: 'An error occurred saving the snapshot'});
            } else {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: 'An error occurred saving the snapshot'});
                } else {
                    res.json({message: 'Successfully saved the snapshot', data: rObj});
                }
            }
        });
    }
};

/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.removeSnapshot = (req, res) => {
    let id = OIDType(req.body.id);
    Snapshot.remove({_id: id, owner : req.session.uid}, (err, num) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred removing the snapshot'});
        } else {
            res.json({message: 'Successfully removed the snapshot', data: num});
        }
    });
};

/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.saveNode = (req, res) => {
    let sObj = req.body;
    if (sObj._id) {
        Node.update({_id: OIDType(sObj._id), owner : req.session.uid}, {$set: pojoify(sObj)}, (err, rObj) => {
            if (err) {
                console.error(err);
                res.status(500).json({message: 'An error occurred saving the node'});
            } else {
                res.json({message: 'Successfully saved the node', data: rObj});
            }
        });
    } else {
        Node.create({
            owner : req.session.uid,
            snapshot: OIDType(sObj.snapshot),
            character: OIDType(sObj.character),
            x: sObj.x,
            y: sObj.y
        }, (err, rObj) => {
            if (err) {
                console.error(err);
                res.status(500).json({message: 'An error occurred saving the node'});
            } else {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: 'An error occurred saving the node'});
                } else {
                    res.json({message: 'Successfully saved the node', data: rObj});
                }
            }
        });
    }
};

/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.removeNode = (req, res) => {
    let id = OIDType(req.body.id);
    Node.remove({_id: id, owner : req.session.uid}, (err, num) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred removing the node'});
        } else {
            res.json({message: 'Successfully removed the node', data: num});
        }
    });
};

/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.addTagToStory = (req, res) => {
    let storyId = OIDType(req.body.storyId);
    let tagName = req.body.tagName;
    Tag.create({parent: storyId, name: tagName}, (err, rObj) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred saving the tag'});
        } else {
            res.json({message: 'Successfully created the tag', data: rObj});
        }
    });
};
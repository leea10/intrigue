const mongoose = require("mongoose");
const schema = require("./../schema");
const User = schema.User;
const Story = schema.Story;
const Character = schema.Character;
const Snapshot = schema.Snapshot;
const Relationship = schema.Relationship;
const Node = schema.Node;
const Tag = schema.Tag;
const OIDType = mongoose.Types.ObjectId;

function pojoify(obj){
    let pojo = {};
    for(var trait in obj){
        if(obj.hasOwnProperty(trait) && trait != "_id"){
            pojo[trait] = obj[trait];
        }
    }
    return pojo
}


/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.saveStory = function (req, res) {
    let sObj = req.body.storyObj;
    if (sObj._id) {
        Story.update({_id: OIDType(sObj._id)}, {$set: pojoify(sObj)}, function (err, rObj) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "An error occurred saving the story"});
            } else {
                res.json({message: "Successfully saved the story", data: rObj});
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
        }, function (err, rObj) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "An error occurred saving the story"});
            } else {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: "An error occurred saving the story"});
                } else {
                    res.json({message: "Successfully saved the story", data: rObj});
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
    Story.findByIdAndRemove(id, function (err, num) {
        if (err) {
            console.error(err);
            res.status(500).json({message: "An error occurred removing the story"});
        } else {
            res.json({message: "Successfully removed the story", data: num});
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
exports.getStories = function (req, res) {
    let userID = req.session.uid;
    Story.find({author: userID}, "_id title description", function (err, docs) {
        if (err) {
            console.error(err);
            res.status(500).json({message: "An error occurred retrieving the stories"});
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
    Story.findOne({author: userID, _id: storyID}).populate("characters snapshots tags").exec(function (err, s1) {
        if (err) {
            console.error(err);
            res.status(500).json({message: "An error occurred retrieving the story"});
        } else {
            Character.populate(s1, {path: "characters.tags", model: "Tag"}, function (err, s2) {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: "An error occurred retrieving the story"});
                } else {
                    Snapshot.populate(s2, {path: "snapshots.nodes", model: "Node"}, function (err, s3) {
                        if (err) {
                            console.error(err);
                            res.status(500).json({message: "An error occurred retrieving the story"});
                        } else {
                            Snapshot.populate(s3, {
                                path: "snapshots.relationships",
                                model: "Relationship"
                            }, function (err, s4) {
                                if (err) {
                                    console.error(err);
                                    res.status(500).json({message: "An error occurred retrieving the story"});
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
    let cObj = req.body.characterObj;
    if (cObj._id) {
        Character.update({_id: OIDType(cObj._id)}, {$set: pojoify(cObj)}, function (err, rObj) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "An error occurred saving the character"});
            } else {
                res.json({message: "Successfully saved the character", data: rObj});
            }
        });
    } else {
        let char = new Character({
            name: cObj.name,
            age: cObj.age,
            description: cObj.description,
            history : cObj.history,
            personality : cObj.personality,
            story : OIDType(cObj.story),
            tags: []
        });
        char.save(function (err, rObj) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "An error occurred saving the character"});
            } else {
                res.json({message: "Successfully saved the character", data: rObj});
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
exports.removeCharacter = function (req, res) {
    let id = OIDType(req.body.id);
    Character.remove({_id: id}, function (err, num) {
        if (err) {
            console.error(err);
            res.status(500).json({message: "An error occurred removing the character"});
        } else {
            res.json({message: "Successfully removed the character", data: num});
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
exports.saveSnapshot = function (req, res) {
    let sObj = req.body.snapshotObj;
    if (sObj._id) {
        Snapshot.update({_id: OIDType(sObj._id)},{$set: pojoify(sObj)}, function (err, rObj) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "An error occurred saving the snapshot"});
            } else {
                res.json({message: "Successfully saved the snapshot", data: rObj});
            }
        });
    } else {
        Snapshot.create({
            story: OIDType(sObj.story),
            label: sObj.label,
            nodes: [],
            relationships: []
        }, function (err, rObj) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "An error occurred saving the snapshot"});
            } else {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: "An error occurred saving the snapshot"});
                } else {
                    res.json({message: "Successfully saved the snapshot", data: rObj});
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
exports.removeSnapshot = function (req, res) {
    let id = OIDType(req.body.id);
    Snapshot.remove({_id: id}, function (err, num) {
        if (err) {
            console.error(err);
            res.status(500).json({message: "An error occurred removing the snapshot"});
        } else {
            res.json({message: "Successfully removed the snapshot", data: num});
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
exports.saveNode = function (req, res) {
    let sObj = req.body.nodeObj;
    if (sObj._id) {
        Node.update({_id: OIDType(sObj._id)}, {$set: pojoify(sObj)}, function (err, rObj) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "An error occurred saving the node"});
            } else {
                res.json({message: "Successfully saved the node", data: rObj});
            }
        });
    } else {
        Node.create({
            snapshot: OIDType(sObj.snapshot),
            character: OIDType(sObj.character),
            x: sObj.x,
            y: sObj.y
        }, function (err, rObj) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "An error occurred saving the node"});
            } else {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: "An error occurred saving the node"});
                } else {
                    res.json({message: "Successfully saved the node", data: rObj});
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
exports.removeNode = function (req, res) {
    let id = OIDType(req.body.id);
    Node.remove({_id: id}, function (err, num) {
        if (err) {
            console.error(err);
            res.status(500).json({message: "An error occurred removing the node"});
        } else {
            res.json({message: "Successfully removed the node", data: num});
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
exports.addTagToStory = function (req, res) {
    let storyId = OIDType(req.body.storyId);
    let tagName = req.body.tagName;
    Tag.create({parent: storyId, name: tagName}, function (err, rObj) {
        if (err) {
            console.error(err);
            res.status(500).json({message: "An error occurred saving the tag"});
        } else {
            res.json({message: "Successfully created the tag", data: rObj});
        }
    });
};
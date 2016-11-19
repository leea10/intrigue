const mongoose = require('mongoose');
const schema = require('./../schema');
const OIDType = mongoose.Types.ObjectId;
const Story = schema.Story;
const Character = schema.Character;
const Snapshot = schema.Snapshot;
const Tag = schema.Tag;
const path = require('path');
const appDir = path.dirname(require.main.filename);

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
 * @function Endpoint for saving a new story
 * @param {object} req
 *   The express HTTP request - should contain fields:
 *   - title : String
 *   - img_extension : String
 *   - description : String
 * @param {object} res
 *   The express HTTP response - JSON object contains fields:
 *   - message : String
 *   - data : Object
 */
exports.saveStory = (req, res) => {
    let sObj = req.body;
    Story.create({
        author : req.session.uid,
        title: sObj.title,
        img_extension : sObj.img_extension,
        description: sObj.description,
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
                if(req.files){
                    let storyImg = req.files.image;
                    storyImg.mv(`${appDir}/public/images/stories/${rObj._id}.${storyImg.name.split('.')[1]}`, (err) => {
                        if(err){
                            console.error(err);
                        }
                        res.json({message: 'Successfully saved the story', data: rObj});
                    });
                } else {
                    res.json({message: 'Successfully saved the story', data: rObj});
                }
            }
        }
    });
};

/**
 * @function Endpoint updating an existing story
 * @param {object} req
 *   The express HTTP request - possible fields:
 *   - title : String
 *   - img_extension : String
 *   - description : String
 *   - characters : [ObjectId]
 *   - snapshots : [ObjectId]
 * @param {object} res
 *   The express HTTP response - JSON object contains fields:
 *   - message : String
 *   - data : Object
 */
exports.updateStory = (req, res) => {
    let sObj = req.body;
    Story.update({_id: OIDType(sObj._id), author : req.session.uid}, {$set: pojoify(sObj)}, (err, rObj) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred saving the story'});
        } else {
            if(rObj.nModified === 0)
                res.status(500).json({message: 'You are not authorized to make this change', data: rObj});
            else {
                if(req.files){
                    let storyImg = req.files.image;
                    storyImg.mv(`${appDir}/public/images/stories/${sObj._id}.${storyImg.name.split('.')[1]}`, (err) => {
                        if(err){
                            console.error(err);
                        }
                        res.json({message: 'Successfully saved the story', data: rObj});
                    });
                } else {
                    res.json({message: 'Successfully saved the story', data: rObj});
                }
            }
        }
    });
};

/**
 * @function Endpoint removing an existing story
 * @param {object} req
 *   The express HTTP request - should contain fields:
 *   - _id : ObjectId
 * @param {object} res
 *   The express HTTP response - JSON object contains fields:
 *   - message : String
 *   - data : Object
 */
exports.removeStory = (req, res) => {
    let id = OIDType(req.body._id);
    Story.findOne({ _id : id, author : req.session.uid}, (err, story) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred removing the story'});
        } else {
            if(story){
                story.remove((err, num) => {
                    if(err){
                        res.status(500).json({message: 'An error occurred removing the story'});
                    } else {
                        res.json({message: 'Successfully removed the story', data: num});
                    }
                });
            } else {
                res.status(500).json({message: 'No story found'});
            }
        }
    });
};

/**
 * @function Endpoint for getting all stories owned by the currently logged in user
 * @param {object} req
 *   The express HTTP request
 * @param {object} res
 *   The express HTTP response - JSON object contains fields:
 *   - message : String
 *   - data : Object
 */
exports.getStories = (req, res) => {
    let userID = req.session.uid;
    Story.find({author: userID}, '_id title description img_extension', (err, docs) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred retrieving the stories'});
        } else {
            res.json({message: `Successfully retrieved ${docs.length} stories`, data: docs});
        }
    });
};

/**
 * @function Endpoint for getting details for a supplied story id
 * @param {object} req
 *   The express HTTP request - should contain fields:
 *   - storyId : ObjectId
 * @param {object} res
 *   The express HTTP response - JSON object contains fields:
 *   - message : String
 *   - data : Object
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
 * @function Endpoint for saving a new character
 * @param {object} req
 *   The express HTTP request - should contain fields:
 *   - name : String
 *   - age : Number
 *   - description : String
 *   - history : String
 *   - personality : String
 *   - img_extension : String
 *   - story : ObjectId
 * @param {object} res
 *   The express HTTP response - JSON object contains fields:
 *   - message : String
 *   - data : Object
 */
exports.saveCharacter = function (req, res) {
    let cObj = req.body;
    Character.create({
        owner : req.session.uid,
        name: cObj.name,
        age: cObj.age,
        description: cObj.description,
        history : cObj.history,
        personality : cObj.personality,
        img_extension : cObj.img_extension,
        story : OIDType(cObj.story),
        tags: []
    }, (err, rObj) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred saving the character'});
        } else {
            if(req.files){
                let characterImg = req.files.image;
                characterImg.mv(`${appDir}/public/images/characters/${rObj._id}.${characterImg.name.split('.')[1]}`, (err) => {
                    if(err){
                        console.error(err);
                    }
                    res.json({message: 'Successfully saved the character', data: rObj});
                });
            } else {
                res.json({message: 'Successfully saved the character', data: rObj});
            }
        }
    });
};

/**
 * @function Endpoint for updating an existing character
 * @param {object} req
 *   The express HTTP request - possible fields:
 *   - name : String
 *   - age : Number
 *   - description : String
 *   - history : String
 *   - personality : String
 *   - img_extension : String
 *   - story : ObjectId
 *   - tags : [ObjectId]
 * @param {object} res
 *   The express HTTP response - JSON object contains fields:
 *   - message : String
 *   - data : Object
 */
exports.updateCharacter = (req, res) => {
    let cObj = req.body;
    Character.update({_id: OIDType(cObj._id), owner : req.session.uid}, {$set: pojoify(cObj)}, (err, rObj) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred saving the character'});
        } else {
            if(req.files){
                let characterImg = req.files.image;
                characterImg.mv(`${appDir}/public/images/characters/${cObj._id}.${characterImg.name.split('.')[1]}`, (err) => {
                    if(err){
                        console.error(err);
                    }
                    res.json({message: 'Successfully saved the character', data: rObj});
                });
            } else {
                res.json({message: 'Successfully saved the character', data: rObj});
            }
        }
    });
};

/**
 * @function Endpoint for removing an existing character
 * @param {object} req
 *   The express HTTP request - should contain fields:
 *   - _id : ObjectId
 * @param {object} res
 *   The express HTTP response - JSON object contains fields:
 *   - message : String
 *   - data : Object
 */
exports.removeCharacter = (req, res) => {
    let id = OIDType(req.body._id);
    Character.findOne({_id: id, owner : req.session.uid}, (err, character) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred removing the character'});
        } else {
            if(character){
                character.remove((err, num) => {
                    if(err) {
                        res.status(500).json({message: 'An error occurred removing the character'});
                    } else {
                        res.json({message: 'Successfully removed the character', data: num});
                    }
                });
            } else {
                res.status(500).json({message: 'No character found'});
            }
        }
    });
};

/**
 * @function Endpoint for adding a tag to an existing story
 * @param {object} req
 *   The express HTTP request - should contain fields:
 *   - storyId : ObjectId
 * @param {object} res
 *   The express HTTP response - JSON object contains fields:
 *   - message : String
 *   - data : Object
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
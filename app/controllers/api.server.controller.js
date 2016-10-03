const mongoose = require("mongoose");
const User = require("./../schema-compiled").User;
const Story = require("./../schema-compiled").Story;
const Character = require("./../schema-compiled").Character;
const Snapshot = require("./../schema-compiled").Snapshot;
const Relationship = require("./../schema-compiled").Relationship;
const Node = require("./../schema-compiled").Node;
const Tag = require("./../schema-compiled").Tag;
const OIDType = mongoose.Schema.Types.ObjectId;


/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.saveStory = function(req, res) {
    let sObj = req.body.storyObj;
    if(sObj._id){
        Story.update({ _id: OIDType(sObj._id) }, { $set: { sObj }}, function(err, rObj){
            if(err){
                console.error(err);
                res.json({status : -1, message : "An error occurred saving the story"});
            } else {
                res.json({status : 1, message: "Successfully saved story", data : rObj});
            }
        });
    } else {
        let story = new Story({
            title : sObj.title,
            description : sObj.description,
            image : sObj.image,
            characters : [],
            snapshots : []
        });
        story.save(function(err, rObj){
            if(err){
                console.error(err);
                res.json({status : -1, message : "An error occurred saving the story"});
            } else {
                User.findByIdAndUpdate(
                    req.session.id,
                    {$push: {"stories": rObj._id}},
                    function(err, model) {
                        if(err){
                            console.error(err);
                            res.json({status : -1, message : "An error occurred saving the story"});
                        } else {
                            res.json({status : 1, message: "Successfully saved story", data : rObj});
                        }
                    }
                );
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
exports.removeStory = function(req, res) {
    let id = OIDType(req.body.id);
    Story.findByIdAndRemove(id, function(err, num){
        if(err){
            console.error(err);
            res.json({status : -1, message : "An error occurred removing the story"});
        } else {
            res.json({status : 1, message: "Successfully removed story", data : num});
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
exports.saveCharacter = function(req, res) {
    let cObj = req.body.characterObj;
    if(cObj._id){
        Character.update({ _id: OIDType(cObj._id) }, { $set: { cObj }}, function(err, rObj){
            if(err){
                console.error(err);
                res.json({status : -1, message : "An error occurred saving the character"});
            } else {
                res.json({status : 1, message: "Successfully saved character", data : rObj});
            }
        });
    } else {
        let char = new Character({
            title : cObj.title,
            description : cObj.description,
            image : cObj.image,
            characters : [],
            snapshots : []
        });
        char.save(function(err, rObj){
            if(err){
                console.error(err);
                res.json({status : -1, message : "An error occurred saving the character"});
            } else {
                res.json({status : 1, message: "Successfully saved character", data : rObj});
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
exports.removeCharacter = function(req, res) {
    let id = OIDType(req.body.id);
    Character.remove({_id : id}, function(err, num){
        if(err){
            console.error(err);
            res.json({status : -1, message : "An error occurred removing the character"});
        } else {
            res.json({status : 1, message: "Successfully removed character", data : num});
        }
    });
};
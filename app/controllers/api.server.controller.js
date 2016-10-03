var mongoose = require("mongoose");
var User = require("./../schema.js").User;
var Story = require("./../schema.js").Story;
var Character = require("./../schema.js").Character;
var Snapshot = require("./../schema.js").Snapshot;
var Relationship = require("./../schema.js").Relationship;
var Node = require("./../schema.js").Node;
var Tag = require("./../schema.js").Tag;


/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.saveStory = function(req, res) {
    const sObj = req.body.storyObj;
    if(sObj._id){
        Story.update({ _id: sObj._id }, { $set: { sObj }}, callback);
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
                res.json({status : -1, message : "Unable to save story"});
            } else {
                res.json({status : 1, message: "Successfully saved story", data : rObj});
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
    const id = req.body.id;as
};

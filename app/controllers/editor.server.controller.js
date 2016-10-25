const Story = require('../schema').Story;
const OIDType = require('mongoose').Types.ObjectId;

exports.render = function(req, res) {
    Story.findOne({
        _id: OIDType(req.query.id)
    }, (err, doc) => {
        res.render("editor", {
            storyTitle: doc.title
        });
    });
};
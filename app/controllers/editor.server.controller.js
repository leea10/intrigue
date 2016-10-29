const Story = require('../schema').Story;
const OIDType = require('mongoose').Types.ObjectId;

exports.render = function(req, res) {
    Story.findOne({
        _id: OIDType(req.query.id)
    }, (err, doc) => {
        if(err){
            res.send(err);
        } else {
            if(doc){
                res.render('editor', {
                    storyTitle: doc.title
                });
            } else {
                res.send('Invalid story ID');
            }
        }
    });
};
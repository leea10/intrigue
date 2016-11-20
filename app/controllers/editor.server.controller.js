const Story = require('../schema').Story;
const OIDType = require('mongoose').Types.ObjectId;

/**
 * @function Renders the editor page
 * @param {object} req
 *   The express HTTP request - query should contain:
 *   - id : ObjectId
 * @param {object} res
 *   The express HTTP response
 */
exports.render = function(req, res) {
    Story.findOne({
        _id: OIDType(req.query.id)
    }, (err, doc) => {
        if(err){
            res.send(err);
        } else {
            if(doc){
                res.render('editor', {
                    storyTitle: doc.title,
                    name : req.session.name
                });
            } else {
                res.send('Invalid story ID');
            }
        }
    });
};
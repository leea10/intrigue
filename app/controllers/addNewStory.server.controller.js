/**
 * Created by espinm3 on 10/7/2016.
 */
exports.render = function(req, res) {
    res.render('landing', {message : req.session.message});
};

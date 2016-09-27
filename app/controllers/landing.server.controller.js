exports.render = function(req, res) {
    res.render('landing', {message : req.session.message});
};

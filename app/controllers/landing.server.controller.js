exports.render = (req, res) => {
    res.render('landing', {message : req.session.message});
};

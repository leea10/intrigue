exports.render = (req, res) => {
    req.session.message = '';
    res.render('dashboard', {
        name: req.session.name
    });
};
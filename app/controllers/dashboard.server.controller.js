exports.render = function(req, res) {
    req.session.message = "";
    res.render("dashboard", {
        name: req.session.name
    });
};
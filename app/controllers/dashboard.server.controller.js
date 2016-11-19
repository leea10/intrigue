/**
 * @function Renders the dashboard page
 * @param {object} req
 *   The express HTTP request
 * @param {object} res
 *   The express HTTP response
 */
exports.render = (req, res) => {
    req.session.message = '';
    res.render('dashboard', {
        name: req.session.name
    });
};
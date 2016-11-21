/**
 * @function Renders the landing page
 * @param {object} req
 *   The express HTTP request
 * @param {object} res
 *   The express HTTP response
 */
exports.render = (req, res) => {
    res.render('landing', {message : req.session.message});
    req.session.message = '';
};

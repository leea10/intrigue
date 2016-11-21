/**
 * @function Renders the landing page
 * @param {object} req
 *   The express HTTP request
 * @param {object} res
 *   The express HTTP response
 */
exports.render = (req, res) => {
    let message = req.session.message;
    req.session.message = '';
    res.render('landing', {message : message});
};

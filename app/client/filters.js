/**
 * @fileoverview Angular filters for this application.
 * @author Ariel Lee
 */

/**
 * Adds a unique timestamp to a url to prevent caching.
 */
app.filter('decache', () => {
    return (input) => {
        return input + '?' + new Date().getTime();
    };
});
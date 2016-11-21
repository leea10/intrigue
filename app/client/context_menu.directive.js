/**
 * @fileoverview Directive for the context menu on the editor canvas.
 */

app.directive('contextMenu', function() {
    return {
        restrict: 'A',
        link: function(scope, element) {
            // Is the context menu open?
            scope.contextMenuOpen = false;

            // Get rid of text highlighting
            element.on('mousedown', (event) => {
                event.preventDefault();
            });

            // Prevent native context menu from popping up on this context menu
            element.on('contextmenu', (event) => {
                event.preventDefault();
            });

            // Open context menu to the correct position.
            scope.$on('contextmenu:open', (_, data) => {
                element.css({
                    left: data.x.toString() + 'px',
                    top: data.y.toString() + 'px'
                });
                scope.contextMenuOpen = true;
                scope.$digest();
            });

            // Close the context menu.
            scope.$on('contextmenu:close', () => {
                scope.contextMenuOpen = false;
                scope.$digest();
            });

            // Emit an event when an option is selected from the context menu.
            scope.selectOption = (option) => {
                scope.$broadcast('contextmenu:' + option);
                scope.contextMenuOpen = false;
            };
        }
    };
});
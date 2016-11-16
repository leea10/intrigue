app.directive('contextMenu', function() {
    return {
        restrict: 'A',
        link: function(scope, element) {
            scope.contextMenuOpen = false;

            // Get rid of text highlighting
            element.on('mousedown', (event) => {
                event.preventDefault();
            });

            // Prevent native context menu from popping up on this context menu
            element.on('contextmenu', (event) => {
                event.preventDefault();
            });

            scope.$on('contextmenu:open', (_, data) => {
                element.css({
                    left: data.x.toString() + 'px',
                    top: data.y.toString() + 'px'
                });
                scope.contextMenuOpen = true;
                scope.$digest();
            });

            scope.$on('contextmenu:close', () => {
                scope.contextMenuOpen = false;
                scope.$digest();
            });

            scope.selectOption = (option) => {
                scope.$broadcast('contextmenu:' + option);
                scope.contextMenuOpen = false;
            };
        }
    };
});
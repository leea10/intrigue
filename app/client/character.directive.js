/**
 * @fileoverview Directive for the character element in the character library.
 */
app.directive('character', ($filter) => {
    return {
        restrict: 'A',
        link: (scope, element, attributes) => {
            // Image URL for the character.
            let base_url = 'images/characters/' + scope.character._id + '.' + scope.character.img_extension;

            // Detect mouse hovering.
            element.on('mouseenter', () => {
                scope.hovered = true;
                scope.$digest();
            });

            element.on('mouseleave', () => {
                scope.hovered = false;
                scope.$digest();
            });

            // When this character is successfully edited and the image has changed, reload the image.
            scope.$on('editCharacterSuccessful', (event, data) => {
                if(data.id === scope.character._id && data.changedImage) {
                    reloadImage();
                }
            });

            // Emits an event for when an action is clicked on the context menu.
            scope.charAction = (action) => {
                scope.$emit(action, {
                    id: scope.character._id
                });
            };

            // Reload the image by forcing it to not cache.
            let reloadImage = () => {
                base_url = 'images/characters/' + scope.character._id + '.' + scope.character.img_extension;
                scope.character.image_url = $filter('decache')(base_url);
            };

            // Initial loading of the image.
            reloadImage();
        }
    };
});
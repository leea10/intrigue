app.directive('character', ($filter) => {
    return {
        restrict: 'A',
        link: (scope, element, attributes) => {
            let base_url = 'images/characters/' + scope.character._id + '.' + scope.character.img_extension;

            element.on('mouseenter', () => {
                scope.hovered = true;
                scope.$digest();
            });

            element.on('mouseleave', () => {
                scope.hovered = false;
                scope.$digest();
            });

            scope.$on('editCharacterSuccessful', (event, data) => {
                if(data.id === scope.character._id && data.changedImage) {
                    reloadImage();
                }
            });

            scope.charAction = (action) => {
                scope.$emit(action, {
                    id: scope.character._id
                });
            };

            let reloadImage = () => {
                base_url = 'images/characters/' + scope.character._id + '.' + scope.character.img_extension;
                scope.character.image_url = $filter('decache')(base_url);
            };

            reloadImage();
        }
    };
});
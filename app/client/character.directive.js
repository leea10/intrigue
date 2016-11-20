app.directive('character', ($filter) => {
    return {
        restrict: 'A',
        link: (scope, element, attributes) => {
            let base_url = 'images/characters/' + scope.character._id + '.' + scope.character.img_extension;
            scope.$on('editCharacterSuccessful', (event, data) => {
                if(data.id === scope.character._id && data.changedImage) {
                    reloadImage();
                }
            });

            let reloadImage = () => {
                scope.character.image_url = $filter('decache')(base_url);
            };

            reloadImage();
        }
    };
});
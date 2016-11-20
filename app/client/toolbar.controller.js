app.controller('ToolbarController', ($scope, EditorService) => {
    $scope.activeTool = null;
    $scope.characters = [];

    // Initialization
    EditorService.init().then(() => {
        $scope.characters = EditorService.getCharacters();
    });

    $scope.onToolClick = (toolName) => {
        if($scope.activeTool === toolName) {
            $scope.onClose();
        } else {
            $scope.setActiveTool(toolName);
        }
    };

    $scope.onClose = () => {
        $scope.activeTool = null;
        $scope.character = null;
        $scope.newCharacter = null;
        $scope.image = null;
        $scope.newImage = null;
        $scope.errorMsg = null;
        $scope.newErrorMsg = null;
        $scope.$broadcast('formClose');
    };

    $scope.setActiveTool = (toolName) => {
        $scope.activeTool = toolName;
    };

    $scope.addCharacter = () => {
        $scope.newErrorMsg = null;
        if(!$scope.newCharacter || !$scope.newCharacter.name) {
            $scope.newErrorMsg = 'Please enter a character name';
        }
        if(!$scope.newErrorMsg){
            if($scope.newImage) {
                $scope.newCharacter.image = $scope.newImage[0];
            }
            EditorService.addCharacter($scope.newCharacter).then(() => {
                $scope.newCharacter = null;
                $scope.setActiveTool(null);
                $scope.$broadcast('formSubmit');
            });
        }
    };

    $scope.selectCharacter = (character) => {
        $scope.setActiveTool(null);
        $scope.$broadcast('library.characterSelected', {
            character: character
        });
    };

    $scope.$on('editCharacter', (_, data) => {
        // Make a deep copy of the given character reference, so we don't accidentally override when editing.
        $scope.character = JSON.parse(JSON.stringify(EditorService.getCharacter(data.id)));
        $scope.setActiveTool('editChar');
    });

    $scope.saveCharacter = () => {
        $scope.errorMsg = null;
        if(!$scope.character || !$scope.character.name) {
            $scope.errorMsg = 'Please enter a character name';
        }
        if(!$scope.errorMsg){
            if($scope.image) {
                $scope.character.image = $scope.image[0];
            }
            EditorService.editCharacter($scope.character).then(() => {
                $scope.$broadcast('editCharacterSuccessful', {
                    id: $scope.character._id,
                    changedImage: !!$scope.image
                });
                $scope.character = null;
                $scope.setActiveTool(null);
                $scope.$broadcast('formSubmit');
            });
        }
    };
});

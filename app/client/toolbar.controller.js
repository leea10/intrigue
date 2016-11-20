app.controller('ToolbarController', ($scope, EditorService) => {
    $scope.activeTool = null;
    $scope.characters = [];

    // Initialization
    EditorService.init().then(() => {
        $scope.characters = EditorService.getCharacters();
    });

    $scope.onToolClick = (toolName) => {
        if($scope.activeTool === toolName) {
            $scope.setActiveTool(null);
        } else {
            $scope.setActiveTool(toolName);
        }
    };

    $scope.onClose = () => {
        $scope.activeTool = null;
        $scope.character = null;
        $scope.$broadcast('formClose');
    };

    $scope.setActiveTool = (toolName) => {
        $scope.activeTool = toolName;
    };

    $scope.saveCharacter = () => {
        $scope.errorMsg = null;
        if(!$scope.character.name) {
            $scope.errorMsg = 'Please enter a character name';
        }
        if(!$scope.errorMsg){
            if($scope.image) {
                $scope.character.image = $scope.image[0];
            }
            EditorService.addCharacter($scope.character).then(() => {
                $scope.character = null;
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
        $scope.character = EditorService.getCharacter(data.id);
        $scope.setActiveTool('editChar');
    });
});

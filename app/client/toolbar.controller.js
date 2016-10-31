app.controller('ToolbarController', ($scope, $http, EditorService) => {
    $scope.activeTool = null;
    $scope.characters = [];
    EditorService.getCharacters().then((characters) => {
        $scope.characters = characters;
    });

    $scope.setActiveTool = (toolName) => {
        $scope.activeTool = toolName;
    };

    $scope.saveCharacter = () => {
        $scope.errorMsg = null;
        if(!$scope.character.name)
            $scope.errorMsg = 'Please enter a character name';
        if(!$scope.errorMsg){
            EditorService.addCharacter($scope.character, () => {
                $scope.setActiveTool(null);
                console.log($scope.characters);
            });
        }
    };
});


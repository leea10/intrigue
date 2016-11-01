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
        if(!$scope.character.name) {
            $scope.errorMsg = 'Please enter a character name';
        }
        if(!$scope.errorMsg){
            if($scope.image) {
                $scope.character.image = $scope.image[0];
            }
            EditorService.addCharacter($scope.character).then(() => {
                $scope.setActiveTool(null);
            });
        }
    };
});

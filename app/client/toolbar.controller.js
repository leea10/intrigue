app.controller('ToolbarController', ($scope, $http, EditorService) => {
    $scope.activeTool = null;
    $scope.characters = [];

    let loadData = () => {
        $scope.characters = EditorService.getCharacters();
    };

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
                $scope.characters = EditorService.getCharacters();
            });
        }
    };

    setTimeout(loadData, 5000);
});


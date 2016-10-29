app.controller('ToolbarController', ($scope, $http, EditorService) => {
    $scope.hideAddCharacterForm = true;

    $scope.toggleHideCharacterForm = () => {
        $scope.hideAddCharacterForm = !$scope.hideAddCharacterForm;
    };

    $scope.saveCharacter = () => {
        $scope.errorMsg = null;
        if(!$scope.character.name)
            $scope.errorMsg = 'Please enter a character name';
        if(!$scope.errorMsg)
            EditorService.addCharacter($scope.character);
    };
});


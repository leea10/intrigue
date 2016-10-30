app.controller('EditorController', ($scope, $http, EditorService) => {
    $scope.hideAddCharacterForm = true;
    $scope.hideCharacterLibrary = true;

    $scope.toggleCreateCharacterForm = () => {
        $scope.hideAddCharacterForm = !$scope.hideAddCharacterForm;
    };

    $scope.toggleCharacterLibrary = () => {
        $scope.characters = EditorService.getCharacters();
        console.log($scope.characters);
        $scope.hideCharacterLibrary = !$scope.hideCharacterLibrary;
    };

    $scope.saveCharacter = () => {
        $scope.errorMsg = null;
        if(!$scope.character.name)
            $scope.errorMsg = 'Please enter a character name';
        if(!$scope.errorMsg){
            console.log($scope.character);
            EditorService.addCharacter($scope.character);
            $scope.toggleCreateCharacterForm();
        }
    };
});


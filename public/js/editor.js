app.controller('EditorController', function($scope) {
    // Function definitions
    $scope.draw = function() {
        console.log(editor);
    };

    // Initialization
    let editor = document.getElementById('editor');
    // TODO(Ariel): Pull these nodes from the server
    let nodes = [];
    $scope.draw();
});
app.controller('EditorCanvasController', function($scope, EditorService) {
    this.currentSnapshot_ = null;
    $scope.nodes = [];
    $scope.relationships = [];

    // Initialization
    EditorService.init().then(() => {
        this.currentSnapshot_ = EditorService.getFirstSnapshotID(); // TEMPORARY HACK.
        $scope.nodes = EditorService.getNodes(this.currentSnapshot_);
        $scope.relationships = EditorService.getRelationships(this.currentSnapshot_);
    });
});
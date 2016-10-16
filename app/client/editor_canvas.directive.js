app.directive('editor', function($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            // Initialization
            let editorCanvas = new EditorCanvas(element[0], 10, 100);
            // TODO(Ariel): Pull these nodes from the server
            let nodes = [
                { x: 100, y: 100, radius: 30 },
                { x: 200, y: 300, radius: 60 },
                { x: 550, y: 400, radius: 60 },
            ];
            for(let i = 0; i < nodes.length; i++) {
                editorCanvas.addNode(nodes[i].x, nodes[i].y, nodes[i].radius);
            }

            // Drawing
            scope.onResize = function() {
                editorCanvas.changeSize($window.innerWidth, $window.innerHeight);
                editorCanvas.draw();
            };
            angular.element($window).on('resize', scope.onResize);
            scope.onResize();
        }
    }
});
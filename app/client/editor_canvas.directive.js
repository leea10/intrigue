app.directive('editor', function($window, SnapshotService) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            // Initialization
            let editorCanvas = new EditorCanvas(element[0], 10, 100);
            // TODO(Ariel): Pull these nodes from the server
            let dragging = false;
            for(let i = 0; i < SnapshotService.nodes.length; i++) {
                let node = SnapshotService.nodes[i];
                editorCanvas.addNode(node.x, node.y, node.radius);
            }

            // Drawing
            scope.onResize = function() {
                editorCanvas.changeSize($window.innerWidth, $window.innerHeight);
                editorCanvas.draw();
            };
            angular.element($window).on('resize', scope.onResize);
            scope.onResize();

            element.bind('mousedown', (event) => {
                dragging = true;
                console.log(event);
                let selected = editorCanvas.getNodeAtPoint(event.offsetX, event.offsetY);
                console.log(selected);
                // If the mouse is inside the bounds of a node
                    // remove that node from the list of nodes to draw
                    // set it as dragged node
            });

            element.bind('mousemove', (event) => {
               if(dragging === true) {
                   console.log('dragging...');
               }
            });

            element.bind('mouseup', (event) => {
                dragging = false;
                // If there's a node being held, release it
                    // put that node back into the list of nodes to draw (At the end)
                    // set dragged node to null
            });
        }
    }
});
app.directive('editor', function($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            // Initialization
            let editorCanvas = new EditorCanvas(element[0], 10, 100);
            // TODO(Ariel): Pull these nodes from the server
            let dragging = false;
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

            element.bind('mousedown', (event) => {
                // If the mouse is inside the bounds of a node
                    // remove that node from the list of nodes to draw
                    // set it as dragged node
                dragging = true;
            });

            element.bind('mousemove', (event) => {
               if(dragging === true) {
                   console.log('dragging...');
               }
            });

            element.bind('mouseup', (event) => {
                // If there's a node being held, release it
                    // put that node back into the list of nodes to draw (At the end)
                    // set dragged node to null
                dragging = false;
            });
        }
    }
});
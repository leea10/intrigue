app.directive('editor', function($window, Snapshot) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            // Initialization
            let editorCanvas = new EditorCanvas(element[0], 10, 100);
            for(let i = 0; i < Snapshot.nodes.length; i++) {
                let node = Snapshot.nodes[i];
                editorCanvas.addNode(node.x, node.y, node.radius);
            }

            let dragging = false;
            let draggedNode = null;
            this.selectedNode_ = null;

            // Drawing
            scope.onResize = function() {
                editorCanvas.changeSize($window.innerWidth, $window.innerHeight);
                editorCanvas.draw();
            };
            angular.element($window).on('resize', scope.onResize);
            scope.onResize();

            element.bind('click', (event) => {
                let selectedNode = editorCanvas.getNodeAtPoint(event.offsetX, event.offsetY);
                if(this.selectedNode_ === selectedNode) {
                    return;
                } else if(this.selectedNode_ !== null) {
                    this.selectedNode_.deselect();
                }
                this.selectedNode_ = selectedNode;
                console.log(this.selectedNode_);
                if(this.selectedNode_ !== null) {
                    this.selectedNode_.select();
                }
                editorCanvas.draw();
            });

            element.bind('mousedown', (event) => {
                let selected = editorCanvas.getNodeAtPoint(event.offsetX, event.offsetY);
                if(event.button === 1) {
                    dragging = true;
                } else if (event.button === 2) {
                    editorCanvas.addNode(event.offsetX, event.offsetY, 40);
                    Snapshot.addNode(event.offsetX, event.offsetY, 40);
                    editorCanvas.draw();
                }
                // console.log(selected);
            });

            // TODO(Ariel): Give the user x pixels of drag inertia
            element.bind('mousemove', (event) => {
               if(dragging === true) {
                   console.log('dragging...');
               }
            });

            element.bind('mouseup', (event) => {
                if(event.which === 1) {
                    dragging = false;
                }
            });

            element.bind('contextmenu', (event) => {
                event.preventDefault();
            })
        }
    }
});
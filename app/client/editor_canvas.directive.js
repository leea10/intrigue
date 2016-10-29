app.directive('editor', function($window, EditorService) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            // Initialization
            let editorCanvas = new EditorCanvas(element[0], 10, 100);
            let canvasContainer = element.parent()[0];
            console.log(canvasContainer.clientWidth + ' ' + canvasContainer.clientHeight);
            for(let i = 0; i < EditorService.nodes.length; i++) {
                let node = EditorService.nodes[i];
                editorCanvas.addNode(node.x, node.y, node.radius);
            }

            let dragging = false;
            this.draggedNode_ = null;
            this.selectedNode_ = null;

            // Drawing
            scope.onResize = function() {
                editorCanvas.changeSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
                editorCanvas.draw();
            };
            angular.element($window).on('resize', scope.onResize);
            scope.onResize();

            element.bind('dblclick', (event) => {
                editorCanvas.addNode(event.offsetX, event.offsetY, 40);
                EditorService.addNode(event.offsetX, event.offsetY, 40);
                editorCanvas.draw();
            });

            element.bind('mousedown', (event) => {
                event.preventDefault();
                let selectedNode = editorCanvas.getNodeAtPoint(event.offsetX, event.offsetY);
                if(event.button === 0) {
                    dragging = true;
                    this.draggedNode_ = selectedNode;
                }
                if(this.selectedNode_ === selectedNode) {
                    return;
                } else if(this.selectedNode_ !== null) {
                    this.selectedNode_.deselect();
                }
                this.selectedNode_ = selectedNode;
                if(this.selectedNode_ !== null) {
                    this.selectedNode_.select();
                }
                editorCanvas.draw();
            });

            // TODO(Ariel): Give the user x pixels of drag inertia
            element.bind('mousemove', (event) => {
               if(dragging === true && this.draggedNode_ !== null) {
                   this.draggedNode_.move(event.movementX, event.movementY);
                   editorCanvas.draw();
               }
            });

            element.bind('mouseup', (event) => {
                if(event.button === 0) {
                    dragging = false;
                    this.draggedNode_ = null;
                }
            });

            element.bind('contextmenu', (event) => {
                event.preventDefault();
            });
        }
    };
});
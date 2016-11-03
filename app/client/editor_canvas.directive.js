app.directive('editor', function($window, EditorService) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            // Initialization
            let editorCanvas = new EditorCanvas(element[0], 10, 100);
            let canvasContainer = element.parent()[0];

            scope.onResize = function() {
                editorCanvas.changeSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
                editorCanvas.draw();
            };
            angular.element($window).on('resize', scope.onResize);

            this.dragging_ = false;
            this.draggedNode_ = null;
            this.selectedNode_ = null;

            // Drawing

            // Event listeners
            scope.$on('library.characterSelected', (_, data) => {
                EditorService.addNode(400, 400, data.character._id);
            });
            
            element.on('mousedown', (event) => {
                event.preventDefault();
                let selectedNode = editorCanvas.getNodeAtPoint(event.offsetX, event.offsetY);
                if(event.button === 0) {
                    this.dragging_ = true;
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
            element.on('mousemove', (event) => {
               if(this.dragging_ === true && this.draggedNode_ !== null) {
                   this.draggedNode_.move(event.movementX, event.movementY);
                   editorCanvas.draw();
               }
            });

            element.on('mouseleave', () => {
                this.dragging_ = false;
            });

            element.on('mouseup', (event) => {
                if(event.button === 0) {
                    this.dragging_ = false;
                    this.draggedNode_ = null;
                }
            });

            element.on('contextmenu', (event) => {
                event.preventDefault();
            });

            // Initialization
            EditorService.getNodes().then((nodes) => {
                this.nodes_ = nodes;
                for(let i = 0; i < this.nodes_.length; i++) {
                    let node = this.nodes_[i];
                    editorCanvas.addNode(node._id, node.x, node.y);
                }
                scope.onResize();
            });
        }
    };
});
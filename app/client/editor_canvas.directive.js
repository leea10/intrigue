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

            this.placingChar_ = null; // Selected character from the library.
            this.dragging_ = false;
            this.draggedNode_ = null;
            this.selectedNode_ = null;

            // Event listeners
            scope.$on('library.characterSelected', (_, data) => {
                this.placingChar_ = data.character;
            });

            element.on('mousedown', (event) => {
                event.preventDefault();
                // Deselect the currently selected node.
                if(this.selectedNode_ !== null) {
                    this.selectedNode_.deselect();
                }

                // If there is a character selected in the library, place it
                if(this.placingChar_ !== null) {
                    EditorService.addNode(event.offsetX, event.offsetY, this.placingChar_._id);
                    // Optimistically render the node
                    this.selectedNode_ = editorCanvas.addNode(this.placingChar_._id, event.offsetX, event.offsetY);
                    this.placingChar_ = null;
                    this.selectedNode_.select();
                } else {
                    // Find the newly selected node.
                    this.selectedNode_ = editorCanvas.getNodeAtPoint(event.offsetX, event.offsetY);
                    if (this.selectedNode_ !== null) {
                        this.selectedNode_.select();
                    }
                    // Start dragging the node if LMB was pressed.
                    if (event.button === 0) {
                        this.dragging_ = true;
                        this.draggedNode_ = this.selectedNode_;
                    }
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
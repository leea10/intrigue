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

            this.currentSnapshot_ = null; // TEMPORARY HACK.
            this.nodes_ = null; // Holds a reference to current snapshot's nodes.
            this.relationships_ = null; // Holds a reference to current snapshot's relationships.

            // Initialization
            EditorService.init().then(() => {
                this.currentSnapshot_ = EditorService.getFirstSnapshotID(); // TEMPORARY HACK.
                console.log(this.currentSnapshot_);
                this.nodes_ = EditorService.getNodes(this.currentSnapshot_);
                for(let i = 0; i < this.nodes_.length; i++) {
                    let node = this.nodes_[i];
                    let character = EditorService.getCharacter(node.character);
                    let imageUrl = '/images/characters/' + node.character + '.' + character.img_extension;
                    editorCanvas.addNode(node.x, node.y, imageUrl, node._id);
                }
                this.relationships_ = EditorService.getRelationships(this.currentSnapshot_);
                for(let i = 0; i < this.relationships_.length; i++) {
                    let relationship = this.relationships_[i];
                    editorCanvas.addRelationship(relationship.start_node, relationship.end_node);
                }
                scope.onResize();
            });

            angular.element($window).on('resize', scope.onResize);

            this.placingChar_ = null; // Selected character from the library.
            this.dragging_ = false;
            this.draggedNode_ = null;
            this.selectedNode_ = null;
            this.placingRelationship_ = false;

            // Event listeners
            scope.$on('library.characterSelected', (_, data) => {
                this.placingChar_ = data.character;
            });

            scope.$on('contextmenu:addRelationship', () => {
                this.placingRelationship_ = true;
            });

            element.on('mousedown', (event) => {
                event.preventDefault();
                // Deselect the currently selected node.
                if(this.selectedNode_ !== null) {
                    this.selectedNode_.deselect();
                }
                // Close any open context menu.
                scope.$broadcast('contextmenu:close');

                // If there is a character selected in the library, place it on LMB click
                if(this.placingChar_ !== null) {
                    if(event.button === 0) {
                        // Optimistically render the node
                        this.selectedNode_ = editorCanvas.addNode(
                            event.offsetX,
                            event.offsetY,
                            '/images/characters/' + this.placingChar_._id + '.' + this.placingChar_.img_extension
                        );
                        let savingNode = this.selectedNode_;
                        EditorService.addNode(this.currentSnapshot_, this.placingChar_._id, event.offsetX, event.offsetY).then((node) => {
                            editorCanvas.indexNode(node._id, savingNode);
                        });
                        this.selectedNode_.select();
                    } // Any other button pressed will merely cancel the action.
                    this.placingChar_ = null;
                } else if(this.placingRelationship_ === true) {
                    if(event.button === 0) {
                        let toNode = editorCanvas.getNodeAtPoint(event.offsetX, event.offsetY);
                        if (toNode !== null) {
                            editorCanvas.addRelationship(this.selectedNode_.id_, toNode.id_);
                            EditorService.addRelationship(this.currentSnapshot_, this.selectedNode_.id_, toNode.id_);
                        }
                    }
                    this.selectedNode_.deselect();
                    this.selectedNode_ = null;
                    this.placingRelationship_ = null;
                } else {
                    // Find the newly selected node.
                    this.selectedNode_ = editorCanvas.getNodeAtPoint(event.offsetX, event.offsetY);
                    if (this.selectedNode_ !== null) {
                        this.selectedNode_.select();
                        // Open context menu if node was selected on RMB
                        if (event.button === 2) {
                            scope.$broadcast('contextmenu:open', {
                                x: event.offsetX,
                                y: event.offsetY
                            });
                        }
                    }
                    // Start dragging the node if LMB was pressed.
                    if (event.button === 0) {
                        this.dragging_ = true;
                        this.draggedNode_ = this.selectedNode_;
                    }
                }
                editorCanvas.draw();
            });

            element.on('mousemove', (event) => {
               if(this.dragging_ === true && this.draggedNode_ !== null) {
                   this.draggedNode_.move(event.movementX, event.movementY);
                   editorCanvas.draw();
               }
            });

            element.on('mouseleave', () => {
                this.releaseNode_();
            });

            element.on('mouseup', (event) => {
                if(event.button === 0) {
                    this.releaseNode_();
                }
            });

            element.on('contextmenu', (event) => {
                event.preventDefault();
            });

            this.releaseNode_ = () => {
                this.dragging_ = false;
                if(this.draggedNode_ !== null) {
                    let node = this.draggedNode_;
                    EditorService.updateNode(node.id_, node.x_, node.y_);
                }
                this.draggedNode_ = null;
            };
        }
    };
});
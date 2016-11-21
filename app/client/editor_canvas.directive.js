/**
 * Manages the logic of the editor's canvas.
 */
app.directive('editor', function($window, EditorService) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            // Grab the appropriate canvas elements from the DOM.
            let editorCanvas = new EditorCanvas(element[0], 10, 100);
            let canvasContainer = element.parent()[0];

            // Resizes the editor canvas.
            scope.onResize = function() {
                editorCanvas.changeSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
                editorCanvas.draw();
            };

            this.currentSnapshot_ = null; // The current snapshot that the editor canvas is representing.
            this.nodes_ = null; // Holds a reference to current snapshot's nodes.
            this.relationships_ = null; // Holds a reference to current snapshot's relationships.
            let characterLookup_ = {}; // A mapping of character IDs to node on this snapshot.

            // Initialization
            EditorService.init().then(() => {
                // Get the first snapshot of the story.
                this.currentSnapshot_ = EditorService.getFirstSnapshotID();
                // Populate the nodes.
                this.nodes_ = EditorService.getNodes(this.currentSnapshot_);
                for(let i = 0; i < this.nodes_.length; i++) {
                    let node = this.nodes_[i];
                    let character = EditorService.getCharacter(node.character);
                    let imageUrl = '/images/characters/' + node.character + '.' + character.img_extension;
                    editorCanvas.addNode(node.x, node.y, imageUrl, node._id);
                }
                // Populate the relationships.
                this.relationships_ = EditorService.getRelationships(this.currentSnapshot_);
                for(let i = 0; i < this.relationships_.length; i++) {
                    let relationship = this.relationships_[i];
                    editorCanvas.addRelationship(relationship.start_node, relationship.end_node);
                }
                // Initial sizing and drawing of the canvas.
                scope.onResize();
            });

            // When the browser window resizes, the canvas should also resize.
            angular.element($window).on('resize', scope.onResize);

            this.placingChar_ = null; // Selected character from the library.
            this.dragging_ = false; // Is the user dragging their mouse?
            this.draggedNode_ = null; // The node that is currently being dragged.
            this.selectedNode_ = null; // The currently selected node.
            this.placingRelationship_ = false; // Is the user in the middle of placing a relationship?

            // Event listeners
            scope.$on('library.characterSelected', (_, data) => {
                // Only let the user place the node if the character doesn't already exist on this snapshot.
                let charNode = getCharNode(data.character._id);
                if (charNode === null) {
                    this.placingChar_ = data.character;
                    let imageURL = '/images/characters/' + data.character._id + '.' + data.character.img_extension;
                    editorCanvas.toggleGhostNode(true, imageURL);
                    element.css('cursor', 'none');
                } else {
                    // Otherwise, select and focus the node on this snapshot that corresponds to this character.
                    if (this.selectedNode_ !== null) {
                        this.selectedNode_.deselect();
                    }
                    let node = editorCanvas.getNodeById(charNode._id);
                    node.select();
                    this.selectedNode_ = node;
                }
                editorCanvas.draw();
            });

            // Event listener for when "Add relationship" is selected off the context menu.
            scope.$on('contextmenu:addRelationship', () => {
                this.placingRelationship_ = true;
                let node = this.selectedNode_;
                // Have an edge from the selected node follow the user's mouse.
                editorCanvas.toggleGhostEdge(true, node.id_, node.x_, node.y_);
                // Hide the user's cursor.
                element.css('cursor', 'none');
                editorCanvas.draw();
            });

            // Event listener for when "Edit" is selected on the context menu.
            scope.$on('contextmenu:editChar', () => {
                // Broadcast an event saying that the user wants to edit a character.
                scope.$broadcast('editCharacter', {
                    id: EditorService.getNode(this.selectedNode_.id_).character
                });
            });

            // Event listener for when "Remove" is selected on the context menu.
            scope.$on('contextmenu:removeNode', () => {
                // Remove this node from the character lookup
                let charID = EditorService.getNode(this.selectedNode_.id_, this.currentSnapshot_).character;
                delete characterLookup_[charID];
                // Delete node from the server.
                EditorService.deleteNode(this.selectedNode_.id_, this.currentSnapshot_);
                // Remove node from the canvas.
                editorCanvas.removeNode(this.selectedNode_);
                this.selectedNode_ = null;
                editorCanvas.draw();
            });

            // Event listener for when a character successfully updates to the server.
            scope.$on('editCharacterSuccessful', (_, data) => {
                // If the image was changed for a character, we want to update the image of the node associated with
                // that character.
                if(data.changedImage) {
                    let characterNode = getCharNode(data.id);
                    if (characterNode) {
                        let imgExt = EditorService.getCharacter(data.id).img_extension;
                        let imgURL = 'images/characters/' + data.id + '.' + imgExt;
                        editorCanvas.getNodeById(characterNode._id).reloadImage(imgURL).then(() => {
                            editorCanvas.draw();
                        });
                    }
                }
            });

            // Event listener for when a node successfully deletes from the server.
            // Particularly helpful when the editor service has to delete a character and its associated nodes.
            scope.$on('deleteNodeSuccessful', (_, data) => {
                // Remove node from the canvas.
                editorCanvas.removeNodeById(data.id);
                editorCanvas.draw();
            });

            // Event listener for when the user cicks anywhere on the canvas.
            element.on('mousedown', (event) => {
                // Prevent any crazy text highlighting.
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
                    // Get rid of the ghost node that follows the user's cursor.
                    editorCanvas.toggleGhostNode(false);
                    element.css('cursor', 'initial');
                } else if(this.placingRelationship_ === true) {
                    // If the user is placing a relationship, connect the currently selected node with the next
                    // selected node on LMB.
                    if(event.button === 0) {
                        let toNode = editorCanvas.getNodeAtPoint(event.offsetX, event.offsetY);
                        if (toNode !== null) {
                            editorCanvas.addRelationship(this.selectedNode_.id_, toNode.id_);
                            EditorService.addRelationship(this.currentSnapshot_, this.selectedNode_.id_, toNode.id_);
                        }
                        // If no node was selected, then cancel the placing of the relationship.
                    }
                    // If any other mouse button was pressed, then cancel the placing of the relationship.
                    this.selectedNode_.deselect();
                    this.selectedNode_ = null;
                    this.placingRelationship_ = null;
                    // Get rid of the ghost edge that follows the user's cursor.
                    editorCanvas.toggleGhostEdge(false);
                    element.css('cursor', 'initial');
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

            // Event listener for when the user moves their mouse over the canvas.
            element.on('mousemove', (event) => {
                // If there's a node being dragged, move the node.
               if(this.dragging_ === true && this.draggedNode_ !== null) {
                   this.draggedNode_.move(event.movementX, event.movementY);
                   editorCanvas.draw();
               } else if (this.placingChar_ !== null) {
                   // If a character is being placed, have the ghost node follow the user's cursor.
                   editorCanvas.moveGhostNode(event.offsetX, event.offsetY);
                   editorCanvas.draw();
               } else if (this.placingRelationship_ === true) {
                   // If a relationship is being placed, have the ghost edge follow the user's cursor.
                   editorCanvas.moveGhostEdge(event.offsetX, event.offsetY);
                   editorCanvas.draw();
               }
            });

            // Forces the user to drop a node they're dragging if their cursor leaves the canvas area in the middle
            // of dragging.
            element.on('mouseleave', () => {
                this.releaseNode_();
            });

            // Stop dragging the node if the user releases their mouse button.
            element.on('mouseup', (event) => {
                if(event.button === 0) {
                    this.releaseNode_();
                }
            });

            // Prevent the native context menu from popping up.
            element.on('contextmenu', (event) => {
                event.preventDefault();
            });

            // Releases the node and updates its position on the server.
            this.releaseNode_ = () => {
                this.dragging_ = false;
                if(this.draggedNode_ !== null) {
                    let node = this.draggedNode_;
                    EditorService.updateNode(node.id_, node.x_, node.y_);
                }
                this.draggedNode_ = null;
            };

            /**
             * @param charID A character's object ID.
             * @returns {*} The node associated with that character on this snapshot or null, if it doesn't exist.
             */
            let getCharNode = (charID) => {
                // First, check to see if we can find it in the lookup.
                let node = characterLookup_[charID];
                if (node !== undefined) {
                    return node;
                }
                // Otherwise, search through the array.
                for (let i = 0; i < this.nodes_.length; i++) {
                    let node = this.nodes_[i];
                    if (node.character === charID) {
                        // If found in the array, add the character to the lookup.
                        characterLookup_[charID] = node;
                        return node;
                    }
                }
                // The character is not on this snapshot.
                return null;
            };
        }
    };
});
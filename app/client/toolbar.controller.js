/**
 * @fileoverview Controller that manages logic for the editor's toolbar and tool panel.
 */
app.controller('ToolbarController', ($scope, EditorService) => {
    $scope.activeTool = null; // The toolbar's active tool.
    $scope.characters = []; // Characters to display in the characer library

    // Initialization
    EditorService.init().then(() => {
        $scope.characters = EditorService.getCharacters();
    });

    /**
     * Event handler for when a tool is clicked in the toolbar.
     * @param toolName The name of the tool that was clicked.
     */
    $scope.onToolClick = (toolName) => {
        if($scope.activeTool === toolName) {
            $scope.onClose();
        } else {
            $scope.setActiveTool(toolName);
        }
    };

    /**
     * Cleanup operation for when the tool panel is closed.
     */
    $scope.onClose = () => {
        $scope.activeTool = null;
        $scope.character = null;
        $scope.newCharacter = null;
        $scope.image = null;
        $scope.newImage = null;
        $scope.errorMsg = null;
        $scope.newErrorMsg = null;
        $scope.$broadcast('formClose');
    };

    /**
     * Sets the currently active tool.
     * @param toolName The tool to set to active.
     */
    $scope.setActiveTool = (toolName) => {
        $scope.activeTool = toolName;
    };

    // Adds character to the database based on form fields.
    $scope.addCharacter = () => {
        $scope.newErrorMsg = null; // Error message to display
        // Display an error message if the user didn't input a character name.
        if(!$scope.newCharacter || !$scope.newCharacter.name) {
            $scope.newErrorMsg = 'Please enter a character name';
        }
        // Submit the request if there are no errors.
        if(!$scope.newErrorMsg){
            // If the user uploaded an image, add that to the request object.
            if($scope.newImage) {
                $scope.newCharacter.image = $scope.newImage[0];
            }
            // Submits the request to the server.
            EditorService.addCharacter($scope.newCharacter).then(() => {
                // Clears the form fields and closes the form.
                $scope.newCharacter = null;
                $scope.setActiveTool(null);
                $scope.$broadcast('formSubmit');
            });
        }
    };

    // Event handler for when a character in the library is clicked.
    $scope.selectCharacter = (character) => {
        // Close the character library.
        $scope.setActiveTool(null);
        // Broadcast an event with the selected character.
        $scope.$broadcast('library.characterSelected', {
            character: character
        });
    };

    // Event listener for when the user wants to edit a character.
    $scope.$on('editCharacter', (_, data) => {
        // Make a deep copy of the given character reference, so we don't accidentally override when editing.
        $scope.character = JSON.parse(JSON.stringify(EditorService.getCharacter(data.id)));
        // Open the edit form.
        $scope.setActiveTool('editChar');
    });

    // Event listener for when the user wants to delete a character.
    $scope.$on('deleteCharacter', (_, data) => {
        // Pup up an alert box to confirm that the user wants to delete this character.
        swal({
                title: "Are you sure?",
                text: "You will not be able to recover this imaginary file!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Delete",
                closeOnConfirm: false
            },
            () => {
                // Submit the request to the server.
                EditorService.deleteCharacter(data.id).then(() => {
                    $scope.$broadcast('deleteCharacterSuccessful', {
                        id: data.id
                    });
                    // Alert the user that the delete was successful.
                    swal('Delete Successful!', 'Your character has been deleted', 'success');
                });
            });
    });

    // Saves the edits a user makes to a character via the edit character form.
    $scope.saveCharacter = () => {
        $scope.errorMsg = null;
        // Displays an error message if the user didn't enter a name.
        if(!$scope.character || !$scope.character.name) {
            $scope.errorMsg = 'Please enter a character name';
        }
        // If there were no errors, proceed with the request.
        if(!$scope.errorMsg){
            // If the user changed the character's image, append the uploaded file to the request.
            if($scope.image) {
                $scope.character.image = $scope.image[0];
            }
            // Submits the request to the server.
            EditorService.editCharacter($scope.character).then(() => {
                $scope.$broadcast('editCharacterSuccessful', {
                    id: $scope.character._id,
                    changedImage: !!$scope.image
                });
                $scope.character = null;
                $scope.setActiveTool(null);
                $scope.$broadcast('formSubmit');
            });
        }
    };
});

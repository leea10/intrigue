/**
 * @fileoverview Manages the client side copy of the application's data and communicates with the server.
 */
app.service('EditorService', function($http, $location, $rootScope) {
    this.storyId_ = $location.search().id;
    this.storyDetails_ = {};
    this.characterLookup_ = {};
    this.snapshotLookup_ = {};
    this.nodeLookup_ = {};

    // Initialization code
    this.initPromise_ = $http.get('/api/story/detail?storyID=' + this.storyId_).then((response) => {
        // Populate story details.
        this.storyDetails_ = response.data.data;
    });

    /**
     * @returns {*} The ID of the first snapshot in the story.
     */
    this.getFirstSnapshotID = () => {
        return this.storyDetails_.snapshots[0]._id;
    };

    /**
     * @returns {Promise} A promise that this editor service will initialize.
     */
    this.init = () => {
        return this.initPromise_;
    };

    /**
     * @param id
     * @returns {*} Snapshot object with the given id.
     */
    this.getSnapshot = (id) => {
        // Checks the snapshot lookup.
        let snapshot = this.snapshotLookup_[id];
        if(snapshot !== undefined) {
            return snapshot;
        }
        // If the lookup misses, search through the snapshot array in story details.
        snapshot = this.searchById_(id, this.storyDetails_.snapshots);
        if(snapshot !== null) {
            // Cache the found object in the lookup.
            this.snapshotLookup_[id] = snapshot;
            return snapshot;
        }
        // Snapshot with given id does not exist in this story.
        return null;
    };

    /**
     * @returns {Array|*} An array of all the character objects in this story.
     */
    this.getCharacters = () => {
        return this.storyDetails_.characters;
    };

    /**
     * @param id
     * @returns {*} Character object with given id.
     */
    this.getCharacter = (id) => {
        // Checks the character lookup.
        let character = this.characterLookup_[id];
        if(character !== undefined) {
            return character;
        }
        // If the lookup misses, search through the character array in story details.
        character = this.searchById_(id, this.storyDetails_.characters);
        if(character !== null) {
            // Cache the found object in the lookup.
            this.characterLookup_[id] = character;
            return character;
        }
        // Character with given id does not exist in this story.
        return null;
    };

    /**
     * @param characterObj Character to add to the story.
     * @returns {Promise} A Promise that resolves when the creation succeeds on the server.
     */
    this.addCharacter = (characterObj) => {
        // Assemble the form data to be sent.
        let fData = new FormData();
        for(let property in characterObj) {
            if(characterObj.hasOwnProperty(property)) {
                fData.append(property, characterObj[property]);
            }
        }
        let imgExtension = characterObj.image ? characterObj.image.name.split('.')[1] : '';
        fData.append('img_extension', imgExtension);
        fData.append('owner', this.storyDetails_.author);
        fData.append('story', this.storyDetails_._id);
        // Submit the new character to the database.
        return $http.post('/api/character', fData, {
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        }).then((response) => {
            console.log(response.data.message);
            // Add newly created story to the client.
            this.storyDetails_.characters.push(response.data.data);
        });
    };

    /**
     * @param characterObj The character to edit on the server, along with its new properties.
     * @returns {Promise} A promise that resolves when the update succeeds on the server.
     */
    this.editCharacter = (characterObj) => {
        // Assemble the form data to send up to the server.
        let fData = new FormData();
        for(let property in characterObj) {
            if(characterObj.hasOwnProperty(property)) {
                if(property === 'tags') {
                    fData.append(property, JSON.stringify(characterObj[property]));
                } else {
                    fData.append(property, characterObj[property]);
                }
            }
        }
        // If the user updated the character image, update the character's image's extension.
        if (characterObj.image !== undefined) {
            characterObj.img_extension = characterObj.image.name.split('.')[1];
            fData.append('img_extension', characterObj.img_extension);
        }
        // Provide the user and story that this character belongs to.
        fData.append('owner', this.storyDetails_.author);
        fData.append('story', this.storyDetails_._id);
        // Submit the update request to the server.
        return $http.put('/api/character', fData, {
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        }).then((response) => {
            console.log(response.data.message);
            // Update the character on the client data.
            let character = this.getCharacter(characterObj._id);
            for(let property in characterObj) {
                if(characterObj.hasOwnProperty(property)) {
                    character[property] = characterObj[property];
                }
            }
        });
    };

    /**
     * @param id The ID of the character to delete off the database.
     * @returns {Promise} A promise that resolves when the operation succeeds.
     */
    this.deleteCharacter = (id) => {
        console.log('successfully deleted the character');
        // Submit the request to the server.
        return $http({
            url: '/api/character',
            method: 'DELETE',
            data : {
                _id : id
            },
            headers : {
                "Content-Type" : "application/json;charset=utf8"
            }
        }).then(() => {
            // Remove the nodes associated with this character.
            let snapshots = this.storyDetails_.snapshots;
            for (let i = 0; i < snapshots.length; i++) {
                let nodes = snapshots[i].nodes;
                for(let j = 0; j < nodes.length; j++) {
                    let node = nodes[j];
                    if (node.character === id) {
                        delete this.nodeLookup_[node._id];
                        nodes.splice(j, 1);
                        $rootScope.$broadcast('deleteNodeSuccessful', {
                            id: node._id
                        });
                    }
                }
            }
            // Remove the character from the client copy of the data.
            this.removeById_(id, this.storyDetails_.characters, this.characterLookup_);
        });
    };

    /**
     * @param snapshotID
     * @returns {Array|*} array of nodes in the given snapshot.
     */
    this.getNodes = (snapshotID) => {
        return this.getSnapshot(snapshotID).nodes;
    };

    /**
     * @param nodeID
     * @param snapshotID [OPTIONAL] heuristic - snapshot that the node might belong to
     * @returns {*} node object with the given node ID.
     */
    this.getNode = (nodeID, snapshotID) => {
        // First, check the node index.
        let node = this.nodeLookup_[nodeID];
        if (node !== undefined) {
            return node;
        }
        // If a snapshotID was provided, restrict the search to the provided snapshot.
        if (snapshotID !== undefined) {
            // If the lookup misses, search through the character array in story details.
            node = this.searchById_(nodeID, this.getSnapshot(snapshotID).nodes);
            if(node !== null) {
                // Cache the found object in the lookup.
                this.nodeLookup_[nodeID] = node;
                return node;
            }
        }
        // Last resort, search the rest of the snapshots.
        let snapshots = this.storyDetails_.snapshots;
        for (let i = 0; i < snapshots.length; i++) {
            let snapshot = snapshots[i];
            // Skipped the snapshot we already checked
            if(snapshot._id === snapshotID) {
                continue;
            }
            // If the lookup misses, search through the character array in story details.
            node = this.searchById_(nodeID, snapshot.nodes);
            if(node !== null) {
                // Cache the found object in the lookup.
                this.nodeLookup_[nodeID] = node;
                return node;
            }
        }
        // Node with given id does not exist in this story.
        return null;
    };

    /**
     * Adds a new node for the given character to the given snapshot.
     * @param snapshotID Snapshot this node should be added to.
     * @param characterID Character that this node represents.
     * @param x Coordinate of the node on the canvas editor.
     * @param y Coordinate of the node of the canvas editor.
     * @returns {Promise}
     */
    this.addNode = (snapshotID, characterID, x, y) => {
        // Submit create request to the server.
        return $http.post('/api/node', {
            snapshot: snapshotID,
            character: characterID,
            x: x,
            y: y
        }).then((response) => {
            console.log(response.data.message);
            let newNode = response.data.data;
            this.getSnapshot(snapshotID).nodes.push(newNode);
            return newNode;
        });
    };

    /**
     * @param nodeID The ID of the node to update.
     * @param x The node's new x position
     * @param y The node's new y position
     */
    this.updateNode = (nodeID, x, y) => {
        $http.put('/api/node', {
            _id: nodeID,
            x: x,
            y: y
        }).then((response) => {
            console.log(response.data.message);
            let updatedNode = this.getNode(nodeID);
            updatedNode.x = x;
            updatedNode.y = y;
        });
    };

    /**
     * @param nodeID The ID of the node to delete.
     * @param snapshotID The ID of snapshot that the node belongs to.
     */
    this.deleteNode = (nodeID, snapshotID) => {
        // Submit delete request to the server.
        $http({
            url: '/api/node',
            method: 'DELETE',
            data : {
                _id : nodeID
            },
            headers : {
                "Content-Type" : "application/json;charset=utf8"
            }
        }).then((response) => {
            console.log(response.data.message);
            // Remove the node on the client copy of the data.
            this.removeById_(nodeID, this.getSnapshot(snapshotID).nodes, this.nodeLookup_);
        });
    };

    /**
     * @param snapshotID
     * @returns {Array|*} array of relationships in the given snapshot.
     */
    this.getRelationships = (snapshotID) => {
        return this.getSnapshot(snapshotID).relationships;
    };

    /**
     * Add a relationship to the database
     * @param snapshotID ID of the snapshot to add the relationship to.
     * @param from ID of the start node
     * @param to ID for the end node
     */
    this.addRelationship = (snapshotID, from, to) => {
        return $http.post('/api/relationship', {
            snapshot: snapshotID,
            start_node: from,
            end_node: to
        }).then((response) => {
            this.getSnapshot(snapshotID).relationships.push(response.data.data);
            console.log(response.data.message);
            return response.data.data;
        });
    };

    /**
     * @param id The ID of the object we are searching for.
     * @param arr The array that we are searching through for the object.
     * @returns {*} Reference to the object, or null if not found.
     * @private
     */
    this.searchById_ = (id, arr) => {
        for(let i = 0; i < arr.length; i++) {
            let obj = arr[i];
            if(obj._id === id){
                return obj;
            }
        }
        return null;
    };

    /**
     * @param id The ID of the object to remove.
     * @param arr The array to remove the object from.
     * @param lookup The lookup to remove the object from.
     * @private
     */
    this.removeById_ = (id, arr, lookup) => {
        // Remove from lookup.
        delete lookup[id];
        // Remove from story details object.
        for (let i = 0; i < arr.length; i++) {
            if(arr[i]._id === id) {
                arr.splice(i, 1);
            }
        }
    };
});
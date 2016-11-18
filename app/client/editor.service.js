app.service('EditorService', function($http, $location) {
    this.storyId_ = $location.search().id;
    this.storyDetails_ = {};
    this.characterLookup_ = {};
    this.snapshotLookup_ = {};
    this.nodeLookup_ = {};

    // Initialization code
    this.initPromise_ = $http.get('/api/story/detail?storyID=' + this.storyId_).then((response) => {
        // Populate story details.
        this.storyDetails_ = response.data.data;
        // Populate character lookup.
        let characters = this.storyDetails_.characters;
        for (let i = 0; i < characters.length; i++) {
            let character = characters[i];
            this.characterLookup_[character._id] = character;
        }
        // Populate snapshot lookup.
        let snapshots = this.storyDetails_.snapshots;
        for (let i = 0; i < snapshots.length; i++) {
            let snapshot = snapshots[i];
            this.snapshotLookup_[snapshot._id] = snapshot;
        }
    });

    // THIS IS A TEMPORARY HACK
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
        let snapshots = this.storyDetails_.snapshots;
        for(let i = 0; i < snapshots.length; i++){
            let snapshot = snapshots[i];
            if(snapshot._id === id){
                // Add snapshot to the lookup.
                this.snapshotLookup_[id] = snapshot;
                return snapshot;
            }
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
        let characters = this.storyDetails_.characters;
        for(let i = 0; i < characters.length; i++){
            let character = characters[i];
            if(character._id === id){
                // Add character to the lookup.
                this.characterLookup_[id] = character;
                return character;
            }
        }
        // Character with given id does not exist in this story.
        return null;
    };

    /**
     * @param characterObj Character to add to the story.
     * @returns {Promise}
     */
    this.addCharacter = (characterObj) => {
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
        return $http.post('/api/character', fData, {
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        }).then((response) => {
            console.log(response.data.message);
            this.storyDetails_.characters.push(response.data.data);
        });
    };

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
            let nodes = this.getSnapshot(snapshotID).nodes;
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i];
                if (node._id === nodeID) {
                    this.nodeLookup_[nodeID] = node;
                    return node;
                }
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
            let nodes = snapshot.nodes;
            for (let j = 0; j < nodes.length; j++) {
                let node = nodes[i];
                if (node._id === nodeID) {
                    this.nodeLookup_[nodeID] = node;
                    return node;
                }
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

    this.getRelationships = (snapshotID) => {
        return this.getSnapshot(snapshotID).relationships;
    };

    /**
     * Add a relationship to the database
     * @param from ID of the start node
     * @param to ID for the end node
     */
    this.addRelationship = (from, to) => {
        console.log(this.currentSnapshot_._id);
        let currentSnapshot = this.currentSnapshot_;
        return $http.post('/api/relationship', {
            snapshot: this.currentSnapshot_._id,
            start_node: from,
            end_node: to
        }).then((response) => {
            currentSnapshot.relationships.push(response.data.data);
            console.log(response.data.message);
            return response.data.data;
        });
    };

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
});
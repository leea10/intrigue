app.service('EditorService', function($http, $location) {
    this.storyId_ = $location.search().id;
    this.storyDetails_ = null;
    this.currentSnapshot_ = null;
    this.characterLookup_ = null;

    // Initialization code
    this.initPromise_ = $http.get('/api/story/detail?storyID=' + this.storyId_).then((response) => {
        // Populate story details
        this.storyDetails_ = response.data.data;
        this.characterLookup_ = {};
        for(let i = 0; i < this.storyDetails_.characters.length; i++){
            this.characterLookup_[this.storyDetails_.characters[i]._id] = this.storyDetails_.characters[i];
        }
        this.currentSnapshot_ = this.storyDetails_.snapshots[0];
        console.log('Loading snapshot ' + this.currentSnapshot_._id);
    });

    this.init = () => {
        return this.initPromise_;
    };

    this.getCharacter = (id) => {
        for(let i = 0; i < this.storyDetails_.characters.length; i++){
            if(this.storyDetails_.characters[i]._id === id){
                this.characterLookup_[id] = this.storyDetails_.characters[i];
                return this.storyDetails_.characters[i];
            }
        }
        return null;
    };

    this.getCharacters = () => {
        return this.storyDetails_.characters;
    };

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

    this.getNodes = () => {
        return this.currentSnapshot_.nodes;
    };

    this.addNode = (x, y, characterID) => {
        $http.post('/api/node', {
            snapshot: this.currentSnapshot_._id,
            character: characterID,
            x: x,
            y: y
        }).then((response) => {
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
            return response.data.data;
        });
    };
});
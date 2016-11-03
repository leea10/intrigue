app.service('EditorService', function($http, $location) {
    this.storyId_ = $location.search().id;
    this.storyDetails_ = null;
    this.currentSnapshot_ = null;

    // Initialization code
    this.initPromise_ = $http.get('/api/story/detail?storyID=' + this.storyId_).then((response) => {
        // Populate story details
        this.storyDetails_ = response.data.data;

        // If there are no snapshots, this is a newly created story and we should create one.
        if(this.storyDetails_.snapshots.length === 0) {
            console.log('Creating the first snapshot...');
            $http.post('/api/snapshot', {
                story: this.storyId_,
                label: 'Snapshot 1'
            }).then((response) => {
                console.log(response.data.message);
                this.storyDetails_.snapshots.push(response.data.data);
                this.currentSnapshot_ = this.storyDetails_.snapshots[0];
                console.log('Loading snapshot ' + this.currentSnapshot_._id);
            });
        } else {
            this.currentSnapshot_ = this.storyDetails_.snapshots[0];
            console.log('Loading snapshot ' + this.currentSnapshot_._id);
            console.log(this.currentSnapshot_);
        }
    });

    this.getCharacters = function(){
        if(this.storyDetails_ === null) {
            return this.initPromise_.then(() => {
                return this.storyDetails_.characters;
            });
        } else {
            return Promise.resolve(this.storyDetails_.characters);
        }
    };

    this.addCharacter = function(characterObj){
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

    this.getNodes = function(){
        if(this.currentSnapshot_ === null) {
            return this.initPromise_.then(() => {
                return this.currentSnapshot_.nodes;
            });
        } else {
            return Promise.resolve(this.currentSnapshot_.nodes);
        }
    };

    this.addNode = function(x, y, characterID) {
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
});
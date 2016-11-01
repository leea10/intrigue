app.service('EditorService', function($http, $location) {
    this.storyId_ = $location.search().id;
    this.storyDetails_ = null;

    this.nodes = [
        { x: 100, y: 100, radius: 30 },
        { x: 200, y: 300, radius: 60 },
        { x: 550, y: 400, radius: 60 },
    ];

    this.addNode = function(x, y, r) {
        // TODO(Ariel): This should do a post request and then push the response as well as returning a promise
        let newNode = {
            x: x,
            y: y,
            radius: r
        };
        this.nodes.push(newNode);
    };

    this.addCharacter = function(characterObj){
        let fData = new FormData();
        for(let property in characterObj) {
            if(characterObj.hasOwnProperty(property)) {
                fData.append(property, characterObj[property]);
            }
        }
        let imgExtension = characterObj.image ? characterObj.image.name.split('.')[1] : '';
        console.log(imgExtension);
        fData.append('img_extension', imgExtension);
        fData.append('owner', this.storyDetails_.author);
        fData.append('story', this.storyDetails_._id);
        return $http.post('/api/character', fData, {
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        }).then((response) => {
            this.storyDetails_.characters.push(response.data.data);
        });
    };

    this.getCharacters = function(){
        if(this.storyDetails_ === null) {
            return $http.get('/api/story/detail?storyID=' + this.storyId_).then((response) => {
                this.storyDetails_ = response.data.data;
                return this.storyDetails_.characters;
            });
        } else {
            return Promise.resolve(this.storyDetails_.characters);
        }
    };

    this.getCharacters();
});
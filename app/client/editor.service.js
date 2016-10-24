app.service('EditorService', function($http, $location) {
    this.storyId_ = $location.search().id;
    // TODO(Ariel): Use this story id to get the correct story details
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
});
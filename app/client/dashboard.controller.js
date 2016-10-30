app.controller('DashboardController', function($scope, $http){
    $scope.stories = [];
    $scope.hideForm = true;

    $scope.addStory = () => {
        let fData = new FormData();
        fData.append('image', $scope.image[0]);
        fData.append('img_extension', $scope.image[0].name.split('.')[1]);
        fData.append('title', $scope.title);
        fData.append('description', $scope.description);
        $http.post('/saveStory', fData, {
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        }).success(function (obj){
            $scope.stories.push(obj);
            console.log(obj);
        }).error(function (err){
            console.log(err);
        });

    };

    $scope.showForm = () => {
        $scope.hideForm = !$scope.hideForm;
    };

    $http.get('/getStories').then((res) => {
        $scope.stories = res.data.data;
    }, (res) => {
        console.log(res);
    });
});

app.directive('filelistBind', function() {
    return function( scope, elm, attrs ) {
        elm.bind('change', function( evt ) {
            scope.$apply(function() {
                scope[ attrs.name ] = evt.target.files;
                console.log( scope[ attrs.name ] );
            });
        });
    };
});


app.controller('DashboardController', function($scope, $http){
    $scope.stories = [];
    $scope.hideForm = true;

    $scope.addStory = () => {
        let fData = new FormData();
        if($scope.image){
            fData.append('image', $scope.image[0]);
            fData.append('img_extension', $scope.image[0].name.split('.')[1]);
        } else {
            fData.append('img_extension', 'jpg');
        }
        fData.append('title', $scope.title);
        fData.append('description', $scope.description);
        $http.post('/api/story', fData, {
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        }).success(function (obj){
            $scope.stories.push(obj.data);
            console.log(obj);
            $scope.showForm();
        }).error(function (err){
            console.log(err);
        });

    };

    $scope.showForm = () => {
        $scope.hideForm = !$scope.hideForm;
    };

    $http.get('/api/story/owned').then((res) => {
        $scope.stories = res.data.data;
    }, (res) => {
        console.log(res);
    });

    $scope.deleteStory = (fData) => {
        $http.post('/removeStory', fData, {
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        }).success(function (obj){

            for (let i = 0; i < $scope.stories.length; i++){
                if ($scope.stories[i]._id == fData._id ){
                    if (i > -1) {
                        $scope.stories.splice(i, 1);
                        break;
                    }
                }
            }

            console.log(obj);
        }).error(function (err){
            console.log(err);
        });
    };

    //Dummy function to test deleteStory function
    $scope.activeMenu = (story) => {
        if (confirm("Would you like to delete story?") === true){
            console.log("User selects to delete story");
            $scope.deleteStory(story);
        }
        else {
            console.log("user does not wish to delete story");
        }
    };

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

app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});


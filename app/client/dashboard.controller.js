app.controller('DashboardController', function($scope, $http){
    $scope.stories = [];
    $scope.hideForm = true;

    $scope.addStory = () => {
        $http.post('/saveStory',{
            title : $scope.title,
            description : $scope.description,
            image: $scope.image
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


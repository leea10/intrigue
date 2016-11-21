/**
 * @fileoverview Controller for handling interactions on the Dashboard page.
 */
app.controller('DashboardController', function($scope, $http){
    // List of user stories to display.
    $scope.stories = [];
    // Should the add story form be hidden?
    $scope.hideForm = true;

    // Adds a new story.
    $scope.addStory = () => {
        // Assemble form data to send to the database.
        let fData = new FormData();
        if($scope.image){
            fData.append('image', $scope.image[0]);
            fData.append('img_extension', $scope.image[0].name.split('.')[1]);
        } else {
            fData.append('img_extension', 'jpg');
        }
        fData.append('title', $scope.title);
        fData.append('description', $scope.description);
        // Submit the new story to the database.
        $http.post('/api/story', fData, {
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        }).then((obj) => {
            console.log(obj.data.message);
            // Create the first snapshot for the story.
            $http.post('/api/snapshot', {
                story: obj.data.data._id,
                label: 'Snapshot 1'
            }).then((response) => {
                console.log(response.data.message);
                $scope.stories.push(obj.data.data);
            });
            // Close and clear the form.
            $scope.showForm();
            $scope.title = null;
            $scope.description = null;
            $scope.$broadcast('formSubmit');
        }).catch((err) => {
            console.log(err);
        });

    };

    // Toggles the visibility of the add story form.
    $scope.showForm = () => {
        $scope.hideForm = !$scope.hideForm;
    };

    // Initial fetch and display of all the stories.
    $http.get('/api/story/owned').then((res) => {
        $scope.stories = res.data.data;
    }, (res) => {
        console.log(res);
    });

    // Delete a story from the database.
    $scope.deleteStory = (delStory) => {
        $http({
            url: '/api/story',
            method: 'DELETE',
            data : {
                _id : delStory._id
            },
            headers : {
                "Content-Type" : "application/json;charset=utf8"
            }
        }).then(function (obj){
            // Delete story from display.
            for (let i = 0; i < $scope.stories.length; i++){
                if ($scope.stories[i]._id == delStory._id ){
                    if (i > -1) {
                        $scope.stories.splice(i, 1);
                        break;
                    }
                }
            }
            console.log(obj);
        }, (obj) => {
            console.log(obj);
        });
    };

    //Dummy function to test deleteStory function
    $scope.activeMenu = (selStory) => {
        if (confirm("Would you like to delete story?") === true){
            console.log("User selects to delete story!");
            $scope.deleteStory(selStory);
        }
        else {
            console.log("user does not wish to delete story");
        }
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
app.config(function($locationProvider) {
   $locationProvider.html5Mode({
       enabled: true,
       requireBase: false
   });
});

app.directive('filelistBind', () => {
    return function( scope, elm, attrs ) {
        elm.bind('change', function( evt ) {
            scope.$apply(function() {
                scope[ attrs.name ] = evt.target.files;
                console.log( scope[ attrs.name ] );
            });
        });
    };
});
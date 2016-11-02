app.config(function($locationProvider) {
   $locationProvider.html5Mode({
       enabled: true,
       requireBase: false
   });
});

app.directive('filelistBind', () => {
    return function( scope, element, attributes ) {
        element.bind('change', function( event ) {
            scope.$apply(function() {
                scope[ attributes.name ] = event.target.files;
            });
        });

        scope.$on('formSubmit', () => {
            for(let i = 0; i < element.length; i++) {
                element[i].value = '';
            }
        });
    };
});
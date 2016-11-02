app.directive('imageInput', () => {
    return function( scope, element, attributes ) {
        let preview = element[0].children[0];
        let input = element[0].children[1];

        element.on('change', function( event ) {
            scope.$apply(function() {
                scope[ input.name ] = event.target.files;
            });
            let fileReader = new FileReader();
            fileReader.onload = (e) => {
                preview.src = e.target.result;
            };
            if(event.target.files[0]) {
                fileReader.readAsDataURL(event.target.files[0]);
            } else {
                preview.src = '/images/characters/';
            }
        });

        scope.$on('formSubmit', () => {
            input.value = '';
            preview.src = '/images/characters/';
        });
    };
});
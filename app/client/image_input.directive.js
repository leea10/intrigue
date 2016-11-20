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
                preview.src = preview.attributes.default_img.nodeValue;
            }
        });

        scope.$on('formSubmit', this.clear);
        scope.$on('formClose', this.clear);

        this.clear = () => {
            input.value = '';
            preview.src = preview.attributes.default_img.nodeValue;
            scope[input.name] = null;
        };
    };
});
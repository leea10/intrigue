/**
 * @fileoverview Directive forimage file upload and preview.
 */
app.directive('imageInput', () => {
    return function( scope, element, attributes ) {
        let preview = element[0].children[0]; // The image preview.
        let input = element[0].children[1]; // The file input control.

        // Event listener for when the user uploads a file.
        element.on('change', function( event ) {
            // Lets the scope know about the file that was just inputted.
            scope.$apply(function() {
                scope[ input.name ] = event.target.files;
            });
            // Reads the file data.
            let fileReader = new FileReader();
            fileReader.onload = (e) => {
                // Updates the image preview to the image the user selected from their file system.
                preview.src = e.target.result;
            };
            if(event.target.files[0]) {
                fileReader.readAsDataURL(event.target.files[0]);
            } else {
                // If no file was selected, display the default image in the preview.
                preview.src = preview.attributes.default_img.nodeValue;
            }
        });

        // Event listeners for when forms are submitted or closed.
        scope.$on('formSubmit', this.clear);
        scope.$on('formClose', this.clear);

        // Resets the file input.
        this.clear = () => {
            input.value = ''; // Get rid of the uploaded file in the input control.
            preview.src = preview.attributes.default_img.nodeValue; // Reset the image preview back to default image.
            scope[input.name] = null;
        };
    };
});
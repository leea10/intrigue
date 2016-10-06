/**
 * TODO(Ariel): Find a better way to organize this mess of code.
 */
app.controller('CanvasController', function($scope) {
    // Function definitions
    $scope.draw = function() {
        // Clear the background
        editor.fillStyle = '#222222';
        editor.fillRect(0, 0, editor.canvas.width, editor.canvas.height);
        $scope.drawGrid(10, 100);
        // Draw the nodes
        for(let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            $scope.drawNode(node.x, node.y, node.radius);
        }
    };

    /**
     * Draws a grid on the canvas.
     * @param smallInc pixels between each thin grid line.
     * @param bigInc pixels between each large grid line.
     */
    $scope.drawGrid = function(smallInc, bigInc) {
        for(let i = 0; i < editor.canvas.width; i+=smallInc) {
            editor.strokeStyle = '#444444';
            editor.lineWidth = i%bigInc === 0 ? 2 : 1;
            // Draw vertical grid line
            $scope.drawLine({x: i, y: 0}, {x: i, y: editor.canvas.height});
            // Draw horizontal grid line
            $scope.drawLine({x: 0, y: i}, {x: editor.canvas.width, y: i});
        }
    }

    /**
     * Draws a line from p1 to p2
     * @param p1 {x:int, y:int}
     * @param p2 {x:int, y:int}
     */
    $scope.drawLine = function(p1, p2) {
        // Draw horizontal line
        editor.beginPath();
        editor.moveTo(p1.x,p1.y);
        editor.lineTo(p2.x, p2.y);
        editor.stroke();
    }

    /**
     * Draws a node of radius at position x, y on the canvas.
     * @param x
     * @param y
     * @param radius
     */
    $scope.drawNode = function(x, y, radius) {
        // Set properties
        editor.fillStyle = '#eeeeee';
        editor.strokeStyle = '#777777';
        editor.lineWidth = 4;

        // Draw the circle
        editor.beginPath();
        editor.arc(x, y, radius, 0, 2*Math.PI, false);
        editor.fill();
        editor.stroke();
    };

    // Initialization
    let editor = document.getElementById('canvas').getContext('2d');
    // TODO(Ariel): Pull these nodes from the server
    let nodes = [
        { x: 100, y: 100, radius: 30 },
        { x: 200, y: 300, radius: 60 },
        { x: 550, y: 400, radius: 60 },
    ];
    $scope.draw();
});
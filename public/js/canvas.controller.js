import Canvas from 'Canvas';

app.controller('CanvasController', function($scope) {
    // Initialization
    let editor = new Canvas(document.getElementById('canvas').getContext('2d'));
    // TODO(Ariel): Pull these nodes from the server
    let nodes = [
        { x: 100, y: 100, radius: 30 },
        { x: 200, y: 300, radius: 60 },
        { x: 550, y: 400, radius: 60 },
    ];
    for(let i = 0; i < nodes.length; i++) {
        editor.addNode(nodes[i]);
    }
    editor.draw();
});
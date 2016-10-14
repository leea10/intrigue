//import EditorCanvas from 'EditorCanvas';

app.controller('CanvasController', function($scope) {
    // Initialization
    let editorCanvas = new EditorCanvas(document.getElementById('canvas'), 10, 100);
    editorCanvas.changeSize(window.innerWidth, window.innerHeight);

    // TODO(Ariel): Pull these nodes from the server
    let nodes = [
        { x: 100, y: 100, radius: 30 },
        { x: 200, y: 300, radius: 60 },
        { x: 550, y: 400, radius: 60 },
    ];
    for(let i = 0; i < nodes.length; i++) {
        editorCanvas.addNode(nodes[i].x, nodes[i].y, nodes[i].radius);
    }
    editorCanvas.draw();
});
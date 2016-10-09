/*export*/ class EditorCanvas {
    constructor(ctx, sInc, bInc) {
        this.canvas_ = ctx;
        this.smallInc_ = sInc; // Number of pixels between each thin grid line.
        this.bigInc_ = bInc;   // Number of pixels between each thick grid line.
        this.nodes_ = [];
    }

    // public methods

    draw() {
        // Clear the background
        this.canvas_.fillStyle = '#222222';
        this.canvas_.fillRect(0, 0, this.width(), this.height());
        this.drawGrid_();
        // Draw the nodes
        for(let i = 0; i < this.nodes_.length; i++) {
            let node = this.nodes_[i];
            this.drawCircle_(node.x, node.y, node.r);
        }
    }

    width() {   return this.canvas_.canvas.width;   }
    height() {  return this.canvas_.canvas.height;  }

    /**
     * Adds a node of radius r at absolute position (x, y).
     * @param x
     * @param y
     * @param r
     */
    addNode(x, y, r) {
        this.nodes_.push({
            x: x,
            y: y,
            r: r
        });
    }

    /**
     * Draws a grid on the canvas.
     */
    drawGrid_() {
        for(let i = 0; i < this.width(); i += this.smallInc_) {
            this.canvas_.strokeStyle = '#444444';
            this.canvas_.lineWidth = i % this.bigInc_ === 0 ? 2 : 1;
            // Draw vertical grid line
            this.drawLine_(
                {x: i, y: 0},
                {x: i, y: this.height()}
            );
            // Draw horizontal grid line
            this.drawLine_(
                {x: 0, y: i},
                {x: this.width(), y: i}
            );
        }
    }

    /**
     * Draws a line from p1 to p2
     * @param p1 {x:int, y:int}
     * @param p2 {x:int, y:int}
     */
    drawLine_(p1, p2) {
        // Draw horizontal line
        this.canvas_.beginPath();
        this.canvas_.moveTo(p1.x,p1.y);
        this.canvas_.lineTo(p2.x, p2.y);
        this.canvas_.stroke();
    }

    /**
     * Draws a node of radius at position x, y on the canvas.
     * @param x
     * @param y
     * @param radius
     */
    drawCircle_(x, y, radius) {
        // Set properties
        this.canvas_.fillStyle = '#eeeeee';
        this.canvas_.strokeStyle = '#8fd3d2';
        this.canvas_.lineWidth = 4;

        // Draw the circle
        this.canvas_.beginPath();
        this.canvas_.arc(x, y, radius, 0, 2*Math.PI, false);
        this.canvas_.fill();
        this.canvas_.stroke();
    }
}
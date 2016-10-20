/**
 * @fileoverview Class solely responsible for drawing onto the editor canvas.
 */
class EditorCanvas {
    /**
     * @param domElement The element in the DOM that the editor should be associated with
     * @param sInc distance between lines on the fine grid.
     * @param bInc distance between lines on the main grid.
     * @constructor
     */
    constructor(domElement, sInc, bInc) {
        this.domElement_ = domElement;
        this.canvas_ = domElement.getContext('2d');
        this.smallInc_ = sInc; // Number of pixels between each thin grid line.
        this.bigInc_ = bInc;   // Number of pixels between each thick grid line.
        this.nodes_ = []; // Nodes to draw (in order)
    }

    // public methods
    /**
     * Changes the editor canvas's dimensions to (width, height).
     * @param width in pixels.
     * @param height in pixels.
     */
    changeSize(width, height) {
        this.domElement_.width = width;
        this.domElement_.height = height;
    }

    draw() {
        // Clear the background
        this.canvas_.fillStyle = '#171717';
        this.canvas_.fillRect(0, 0, this.width(), this.height());
        this.drawGrid_();
        // Draw the nodes
        for(let i = 0; i < this.nodes_.length; i++) {
            this.nodes_[i].draw(this.canvas_);
        }
    }

    width() {   return this.canvas_.canvas.width;   }
    height() {  return this.canvas_.canvas.height;  }

    /**
     * @param x
     * @param y
     * @returns {Node} The top node that intersects the point (x,y)
     */
    getNodeAtPoint(x, y) {
        for(let i = this.nodes_.length - 1; i >= 0; i--) {
            if(this.nodes_[i].intersectsPoint(x, y)) {
                return this.nodes_[i];
            }
        }
        return null;
    }

    /**
     * Adds a node of radius r at absolute position (x, y).
     * @param x
     * @param y
     * @param r
     */
    addNode(x, y, r) {
        this.nodes_.push(new Node(x, y, r));
    }

    /**
     * Draws a grid on the canvas.
     */
    drawGrid_() {
        for(let i = 0; i < this.width(); i += this.smallInc_) {
            this.canvas_.strokeStyle = '#2c2c2c';
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
}

/* export */ class Node {
    constructor(x, y, radius) {
        this.x_ = x;
        this.y_ = y;
        this.radius_ = radius;
        this.strokeColor_ = '#8fd3d2';
        this.strokeWeight_ = 4;
    }

    draw(ctx) {
        // Set properties
        ctx.fillStyle = '#fefefe';
        ctx.strokeStyle = this.strokeColor_;
        ctx.lineWidth = this.strokeWeight_;

        // Draw the circle
        ctx.beginPath();
        ctx.arc(this.x_, this.y_, this.radius_, 0, 2*Math.PI, false);
        ctx.fill();
        ctx.stroke();
    }

    /**
     * Dispplaces the node
     * @param x Number of pixels to displace horizontally
     * @param y Number of pixles to displace vertically
     */
    move(x, y) {
        this.x_ += x;
        this.y_ += y;
    }

    /**
     * Checks if point (x, y) lies inside the node
     * @param x
     * @param y
     * @returns {boolean}
     */
    intersectsPoint(x, y) {
        // Distance check
        return Math.sqrt(Math.pow(x-this.x_, 2) + Math.pow(y-this.y_, 2)) <= this.radius_;
    }

    /**
     * Changes the node to draw in a selected state.
     */
    select() {
        this.strokeColor_ = 'blue';
        this.strokeWeight_ = 6;
    }

    /**
     * Changes the node to draw in a normal state.
     */
    deselect() {
        this.strokeColor_ = '#8fd3d2';
        this.strokeWeight_ = 4;
    }
}
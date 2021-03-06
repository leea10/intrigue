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
        this.nodes_ = [];
        this.nodeIndex_ = {};
        this.relationships_ = [];
        this.ghostNode_ = null;
        this.ghostEdge_ = null;
    }

    /**
     * Changes the editor canvas's dimensions to (width, height).
     * @param width in pixels.
     * @param height in pixels.
     */
    changeSize(width, height) {
        this.domElement_.width = width;
        this.domElement_.height = height;
    }

    /**
     * Displays the state of the canvas.
     */
    draw() {
        // Clear the background.
        this.canvas_.fillStyle = '#171717';
        this.canvas_.fillRect(0, 0, this.width(), this.height());
        this.drawGrid_();
        // Draw the relationships
        this.canvas_.strokeStyle = '#bbb';
        this.canvas_.lineWidth = 4;
        for(let i = 0; i < this.relationships_.length; i++) {
            let relationship = this.relationships_[i];
            let fromNode =  this.nodeIndex_[relationship.from_];
            let toNode =  this.nodeIndex_[relationship.to_];
            this.drawLine_(
                {x: fromNode.x_, y: fromNode.y_},
                {x: toNode.x_, y: toNode.y_}
            );
        }
        // Draw the ghost edge.
        if(this.ghostEdge_ !== null) {
            let startNode = this.nodeIndex_[this.ghostEdge_.startNode];
            this.drawLine_(
                {x: startNode.x_, y: startNode.y_},
                {x: this.ghostEdge_.x, y: this.ghostEdge_.y}
            );
        }
        // Draw the nodes.
        for(let i = 0; i < this.nodes_.length; i++) {
            this.nodes_[i].draw(this.canvas_);
        }
        // Draw the ghost node.
        if(this.ghostNode_ !== null) {
            this.canvas_.save();
            this.canvas_.globalAlpha = 0.3;
            this.ghostNode_.draw(this.canvas_);
            this.canvas_.restore();
        }
    }

    /**
     * @returns {number} The width of the canvas element in pixels.
     */
    width() {   return this.canvas_.canvas.width;   }

    /**
     * @returns {number} The height of the canvas element in pixels.
     */
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
     * Sets the ghost node
     * @param isVisible
     * @param imageURL The image the ghost node should have.
     */
    toggleGhostNode(isVisible, imageURL) {
        imageURL = imageURL === undefined ? '/images/characters/' : imageURL;
        this.ghostNode_ = isVisible ? new Node(100, 100, imageURL) : null;
    }

    /**
     * Moves the ghost node to x,y.
     * @param x
     * @param y
     */
    moveGhostNode(x, y) {
        if(this.ghostNode_ !== null) {
            this.ghostNode_.x_ = x;
            this.ghostNode_.y_ = y;
        }
    }

    /**
     * Sets the ghost edge
     * @param isVisible
     * @param startNode The node that the edge will start at.
     * @param x The x coordinate of the point that the edge will end at.
     * @param y The y coordinate of the point that the edge will end at.
     */
    toggleGhostEdge(isVisible, startNode, x, y) {
        this.ghostEdge_ = isVisible ? {
            startNode: startNode,
            x: x,
            y: y
        } : null;
    }

    /**
     * Moves the end point of the ghost relationship to x,y.
     * @param x
     * @param y
     */
    moveGhostEdge(x, y) {
        if(this.ghostEdge_ !== null) {
            this.ghostEdge_.x = x;
            this.ghostEdge_.y = y;
        }
    }

    /**
     * @param id The node of the ID we're looking for.
     * @returns {*} The node with the given id.
     */
    getNodeById(id) {
        return this.nodeIndex_[id];
    }

    /**
     * Adds a node of radius r at absolute position (x, y).
     * @param id
     * @param x
     * @param y
     * @param img
     * @return Node the node that was just created
     */
    addNode(x, y, img, id) {
        let newNode = new Node(x, y, img, id);
        this.nodes_.push(newNode);
        // Draw the node only after the image has loaded.
        newNode.imageLoaded().then(() => {
            this.draw();
        });
        // Add the node to the lookup.
        if(id !== undefined) {
            this.nodeIndex_[id] = newNode;
        }
        return newNode;
    }

    /**
     * Removes a node and its attached relationships from the editor canvas.
     * @param node The node to remove.
     */
    removeNode(node) {
        // Remove the node from the lookup.
        delete this.nodeIndex_[node.id];
        // Remove the node from the nodes array.
        for(let i = 0; i < this.nodes_.length; i++) {
            if(this.nodes_[i].id_ === node.id_) {
                this.nodes_.splice(i, 1);
                i--;
            }
        }
        // Remove any relationships that involved this node.
        for(let i = 0; i < this.relationships_.length; i++) {
            let relationship = this.relationships_[i];
            if(relationship.from_ === node.id_ || relationship.to_ === node.id_) {
                this.relationships_.splice(i, 1);
                i--;
            }
        }
    }

    /**
     * Removes a node and its attached relationships from the editor canvas.
     * @param id The ID of node to remove.
     */
    removeNodeById(id) {
        let node = this.nodeIndex_[id];
        if(node) {
            this.removeNode(node);
        }
    }

    /**
     * adds node to index under a unique id
     * @param id
     * @param node
     */
    indexNode(id, node) {
        this.nodeIndex_[id] = node;
        node.id_ = id;
    }

    /**
     * Adds a relationship between node1 and node2
     * @param node1 id of first node
     * @param node2 id of second node
     */
    addRelationship(node1, node2) {
        this.relationships_.push(new Edge(node1, node2));
    }

    /**
     * Draws a grid on the canvas.
     */
    drawGrid_() {
        for(let i = 0; i < this.width(); i += this.smallInc_) {
            this.canvas_.strokeStyle = '#2c2c2c';
            // The line will show up thicker every this.bigInc_ intervals.
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

/**
 * Class that holds data for a single node on the EditorCanvas.
 */
class Node {
    constructor(x, y, imgUrl, id) {
        this.id_ = id;
        this.x_ = x;
        this.y_ = y;
        this.radius_ = 60;
        this.strokeColor_ = '#8fd3d2';
        this.strokeWeight_ = 4;
        this.img_ = new Image();
        this.img_.src = imgUrl;
    }

    /**
     * @returns {Promise} A promise that will resolve when the image is loaded.
     */
    imageLoaded() {
        return new Promise((resolve) => {
            this.img_.onload = resolve;
        });
    }

    /**
     * Reloads image drawn on the node.
     * @param {string} newURL The URL of the new image to load.
     * @returns {Promise} A promise that will resolve when the image is loaded.
     */
    reloadImage(newURL) {
        this.img_ = new Image();
        this.img_.src = newURL + '?' + new Date().getTime();
        return this.imageLoaded();
    }

    /**
     * Displays the state of the node on the given canvas.
     * @param ctx The given canvas to draw on.
     */
    draw(ctx) {
        // Set properties.
        ctx.fillStyle = '#fefefe';
        ctx.strokeStyle = this.strokeColor_;
        ctx.lineWidth = this.strokeWeight_;
        // Draw the circle.
        ctx.beginPath();
        ctx.arc(this.x_, this.y_, this.radius_, 0, 2*Math.PI, false);
        ctx.closePath();
        ctx.fill();
        // Draw the image inside the circle.
        ctx.save();
        ctx.clip();
        // Determine how the image is drawn based on aspect ratio.
        let isTaller = this.img_.height >= this.img_.width;
        let sourceX = isTaller ? 0 : this.img_.width / 4;
        let sourceY = isTaller ? this.img_.height / 4 : 0;
        let squareDimension = isTaller ? this.img_.width : this.img_.height;
        ctx.drawImage(
            this.img_,
            sourceX, sourceY,
            squareDimension, squareDimension,
            this.x_ - this.radius_,
            this.y_ - this.radius_,
            this.radius_ * 2,
            this.radius_ * 2
        );
        ctx.restore();
        // Draw the outline on top of the image.
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
        this.strokeColor_ = '#8E7CC3';
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

/**
 * A class to represent an edge on the canvas.
 */
class Edge {
    constructor(from, to) {
        this.from_ = from;
        this.to_ = to;
    }
}
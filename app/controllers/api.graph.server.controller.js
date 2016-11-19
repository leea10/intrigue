const mongoose = require('mongoose');
const schema = require('./../schema');
const Snapshot = schema.Snapshot;
const Relationship = schema.Relationship;
const Node = schema.Node;
const OIDType = mongoose.Types.ObjectId;

let pojoify = (obj) => {
    let pojo = {};
    for(var trait in obj){
        if(obj.hasOwnProperty(trait) && trait != '_id'){
            pojo[trait] = obj[trait];
        }
    }
    return pojo;
};


/**
 * @function Endpoint for saving a new snapshot
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.saveSnapshot = (req, res) => {
    let sObj = req.body;
    Snapshot.create({
        owner : req.session.uid,
        story: OIDType(sObj.story),
        label: sObj.label,
        nodes: [],
        relationships: []
    }, (err, rObj) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred saving the snapshot'});
        } else {
            res.json({message: 'Successfully saved the snapshot', data: rObj});
        }
    });
};

/**
 * @function Endpoint for updating an existing snapshot
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.updateSnapshot = (req, res) => {
    let sObj = req.body;
    Snapshot.update({_id: OIDType(sObj._id), owner : req.session.uid},{$set: pojoify(sObj)}, (err, rObj) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred saving the snapshot'});
        } else {
            res.json({message: 'Successfully saved the snapshot', data: rObj});
        }
    });
};

/**
 * @function Endpoint for removing an existing snapshot
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.removeSnapshot = (req, res) => {
    let id = OIDType(req.body._id);
    Snapshot.findOne({_id: id, owner : req.session.uid}, (err, snapshot) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred removing the snapshot'});
        } else {
            if(snapshot) {
                snapshot.remove((err, num) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({message: 'An error occurred removing the snapshot'});
                    } else {
                        res.json({message: 'Successfully removed the snapshot', data: num});
                    }
                });
            } else {
                res.status(500).json({message: 'Snapshot not found'});
            }
        }
    });
};

/**
 * @function Endpoint for saving a new relationship
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.saveRelationship = (req, res) => {
    let sObj = req.body;
    if(sObj.tags === undefined) {
        sObj.tags = [];
    }
    Relationship.create({
        owner : req.session.uid,
        snapshot: OIDType(sObj.snapshot),
        start_node : OIDType(sObj.start_node),
        end_node : OIDType(sObj.end_node),
        description : sObj.description,
        tags : sObj.tags.map((elem) => {return OIDType(elem);})
    }, (err, rObj) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred saving the relationship'});
        } else {
            res.json({message: 'Successfully saved the relationship', data: rObj});
        }
    });
};

/**
 * @function Endpoint for updating an existing relationship
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.updateRelationship = (req, res) => {
    let sObj = req.body;
    Relationship.update({_id: OIDType(sObj._id), owner : req.session.uid}, {$set: pojoify(sObj)}, (err, rObj) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred saving the node'});
        } else {
            res.json({message: 'Successfully saved the node', data: rObj});
        }
    });
};

/**
 * @function Endpoint for removing an existing relationship
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.removeRelationship = (req, res) => {
    let id = OIDType(req.body._id);
    Relationship.findOne({_id: id, owner : req.session.uid}, (err, relationship) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred removing the relationship'});
        } else {
            if(relationship) {
                relationship.remove((err, num) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({message: 'An error occurred removing the relationship'});
                    } else {
                        res.json({message: 'Successfully removed the relationship', data: num});
                    }
                });
            } else {
                res.status(500).json({message: 'Relationship not found'});
            }
        }
    });
};

/**
 * @function Endpoint for saving a new node
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.saveNode = (req, res) => {
    let sObj = req.body;
    Node.create({
        owner : req.session.uid,
        snapshot: OIDType(sObj.snapshot),
        character: OIDType(sObj.character),
        x: sObj.x,
        y: sObj.y
    }, (err, rObj) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred saving the node'});
        } else {
            res.json({message: 'Successfully saved the node', data: rObj});
        }
    });
};

/**
 * @function Endpoint for updating an existing node
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.updateNode = (req, res) => {
    let sObj = req.body;
    Node.update({_id: OIDType(sObj._id), owner : req.session.uid}, {$set: pojoify(sObj)}, (err, rObj) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred saving the node'});
        } else {
            res.json({message: 'Successfully saved the node', data: rObj});
        }
    });
};

/**
 * @function Endpoint for removing an existing node
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.removeNode = (req, res) => {
    let id = OIDType(req.body._id);
    Node.findOne({_id: id, owner : req.session.uid}, (err, node) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred removing the node'});
        } else {
            if(node){
                node.remove((err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({message: 'An error occurred removing the node'});
                    } else {
                        res.json({message: 'Successfully removed the node', data: num});
                    }
                });
            } else {
                res.status(500).json({message: 'Node not found'});
            }
        }
    });
};
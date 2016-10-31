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
 *
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
            if (err) {
                console.error(err);
                res.status(500).json({message: 'An error occurred saving the snapshot'});
            } else {
                res.json({message: 'Successfully saved the snapshot', data: rObj});
            }
        }
    });
};

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
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.removeSnapshot = (req, res) => {
    let id = OIDType(req.body.id);
    Snapshot.remove({_id: id, owner : req.session.uid}, (err, num) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred removing the snapshot'});
        } else {
            res.json({message: 'Successfully removed the snapshot', data: num});
        }
    });
};

/**
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.saveRelationship = (req, res) => {
    let sObj = req.body;
    Relationship.create({
        owner : req.session.uid,
        snapshot: OIDType(sObj.snapshot),
        characters: sObj.characters.map((elem) => {return OIDType(elem);}),
        nodes : sObj.nodes.map((elem) => {return OIDType(elem);}),
        description : sObj.description,
        tags : sObj.tags.map((elem) => {return OIDType(elem);})
    }, (err, rObj) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred saving the node'});
        } else {
            if (err) {
                console.error(err);
                res.status(500).json({message: 'An error occurred saving the node'});
            } else {
                res.json({message: 'Successfully saved the node', data: rObj});
            }
        }
    });
};

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
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.removeRelationship = (req, res) => {
    let id = OIDType(req.body.id);
    Relationship.remove({_id: id, owner : req.session.uid}, (err, num) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred removing the relationship'});
        } else {
            res.json({message: 'Successfully removed the relationship', data: num});
        }
    });
};

/**
 *
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
            if (err) {
                console.error(err);
                res.status(500).json({message: 'An error occurred saving the node'});
            } else {
                res.json({message: 'Successfully saved the node', data: rObj});
            }
        }
    });
};

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
 *
 * @param {object} req
 *   The express HTTP request containing the information required for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.removeNode = (req, res) => {
    let id = OIDType(req.body.id);
    Node.remove({_id: id, owner : req.session.uid}, (err, num) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'An error occurred removing the node'});
        } else {
            res.json({message: 'Successfully removed the node', data: num});
        }
    });
};
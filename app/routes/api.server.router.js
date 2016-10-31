var express = require('express');
var router = express.Router();

const graphAPI = require('../controllers/api.graph.server.controller.js');
const storyAPI = require('../controllers/api.story.server.controller.js');

router.use((req, res, next) => {
    if(req.session && req.session.uid)
        next();
    else
        res.status(401, 'Unauthorized');
});

//API
router.get('/story/owned', storyAPI.getStories);
router.get('/story/detail', storyAPI.getStoryDetails);

router.post('/story', storyAPI.saveStory);
router.post('/character', storyAPI.saveCharacter);
router.post('/snapshot', graphAPI.saveSnapshot);
router.post('/relationship', graphAPI.saveRelationship);
router.post('/node', graphAPI.saveNode);

router.put('/story', storyAPI.updateStory);
router.put('/character', storyAPI.updateCharacter);
router.put('/snapshot', graphAPI.updateSnapshot);
router.put('/relationship', graphAPI.updateRelationship);
router.put('/node', graphAPI.updateNode);

router.delete('/story', storyAPI.removeStory);
router.delete('/character', storyAPI.removeCharacter);
router.delete('/snapshot', graphAPI.removeSnapshot);
router.delete('/relationship', graphAPI.removeRelationship);
router.delete('/node', graphAPI.removeNode);

module.exports = router;
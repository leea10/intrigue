var express = require('express');
var router = express.Router();

const auth = require('../controllers/auth.server.controller');
const graphAPI = require('../controllers/api.graph.server.controller.js');
const storyAPI = require('../controllers/api.story.server.controller.js');

//API
router.get('/story/owned', auth.isLoggedIn, storyAPI.getStories);
router.get('/story/detail', auth.isLoggedIn, storyAPI.getStoryDetails);

router.post('/story', auth.isLoggedIn, storyAPI.saveStory);
router.post('/character', auth.isLoggedIn, storyAPI.saveCharacter);
router.post('/snapshot', auth.isLoggedIn, graphAPI.saveSnapshot);
router.post('/relationship', auth.isLoggedIn, graphAPI.saveRelationship);
router.post('/node', auth.isLoggedIn, graphAPI.saveNode);

router.put('/story', auth.isLoggedIn, storyAPI.updateStory);
router.put('/character', auth.isLoggedIn, storyAPI.updateCharacter);
router.put('/snapshot', auth.isLoggedIn, graphAPI.updateSnapshot);
router.put('/relationship', auth.isLoggedIn, graphAPI.updateRelationship);
router.put('/node', auth.isLoggedIn, graphAPI.updateNode);

router.delete('/story', auth.isLoggedIn, storyAPI.removeStory);
router.delete('/character', auth.isLoggedIn, storyAPI.removeCharacter);
router.delete('/snapshot', auth.isLoggedIn, graphAPI.removeSnapshot);
router.delete('/relationship', auth.isLoggedIn, graphAPI.removeRelationship);
router.delete('/node', auth.isLoggedIn, graphAPI.removeNode);

module.exports = router;
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  globalSearch,
  getSearchSuggestions,
  searchFreelancers,
  getJobRecommendations,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch
} = require('../controllers/searchController');

// All routes require authentication
router.use(protect);

router.get('/', globalSearch);
router.get('/suggestions', getSearchSuggestions);
router.get('/freelancers', searchFreelancers);
router.get('/recommendations', getJobRecommendations);
router.route('/saved')
  .get(getSavedSearches)
  .post(saveSearch);
router.delete('/saved/:searchId', deleteSavedSearch);

module.exports = router;
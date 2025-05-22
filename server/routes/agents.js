const express = require('express');
const {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
} = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// Routes
router
  .route('/')
  .get(getAgents)
  .post(createAgent);

router
  .route('/:id')
  .get(getAgent)
  .put(updateAgent)
  .delete(deleteAgent);

module.exports = router;
const express = require('express');
const router = express.Router();

const {
  uploadList,
  getAgentLists,
  getAllLists,
  reassignList,
  deleteList
} = require('../controllers/listController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 🔐 Protect all list routes
router.use(protect);

// 📌 Admin-only routes
router.use(authorize('admin'));

// Upload a list
router.post('/upload', upload.single('file'), uploadList);

// Get all lists
router.get('/', getAllLists);

// Get lists by agent ID
router.get('/agent/:agentId', getAgentLists);

// Reassign list to different agent
router.put('/:listId/reassign', reassignList);

// Delete a specific list
router.delete('/:listId', deleteList);

module.exports = router;
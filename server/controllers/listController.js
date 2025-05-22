const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { processFile } = require('../utils/fileValidator');
const Agent = require('../models/Agent');
const List = require('../models/List');

// Helper function to distribute items among agents
const distributeItems = (items, agents, fileName) => {
  // Create an array to hold the distributed lists
  const distributedLists = [];
  
  // Determine how many items each agent should get
  const agentCount = agents.length;
  const totalItems = items.length;
  const baseItemsPerAgent = Math.floor(totalItems / agentCount);
  const extraItems = totalItems % agentCount;
  
  let itemIndex = 0;
  
  // Distribute items to each agent
  agents.forEach((agent, agentIndex) => {
    // Calculate how many items this agent should get
    // If there are remainder items, give one extra to the first few agents
    const itemsForThisAgent = baseItemsPerAgent + (agentIndex < extraItems ? 1 : 0);
    
    // Create a list for this agent
    const agentList = {
      agent: agent._id,
      items: [],
      fileName: fileName
    };
    
    // Add the appropriate number of items to this agent's list
    for (let i = 0; i < itemsForThisAgent; i++) {
      if (itemIndex < totalItems) {
        agentList.items.push(items[itemIndex]);
        itemIndex++;
      }
    }
    
    // Add this agent's list to our collection of distributed lists
    if (agentList.items.length > 0) {
      distributedLists.push(agentList);
    }
  });
  
  return distributedLists;
};

// @desc    Upload list file and distribute to agents
// @route   POST /api/lists/upload
// @access  Private
exports.uploadList = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file',
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Process and validate the file
    let items;
    try {
      items = await processFile(filePath);
    } catch (error) {
      // Delete the file if validation fails
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Get all agents
    const agents = await Agent.find().select('_id');

    if (agents.length === 0) {
      // Delete the file if no agents
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        error: 'No agents found to distribute the list',
      });
    }

    // Distribute items equally among agents
    const distributedLists = distributeItems(items, agents, fileName);

    // Save distributed lists to database
    const savedLists = await List.insertMany(distributedLists);

    // Delete the file after processing
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      data: savedLists,
    });
  } catch (error) {
    // Delete the file if any error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get lists for a specific agent
// @route   GET /api/lists/agent/:agentId
// @access  Private
exports.getAgentLists = async (req, res) => {
  try {
    const { agentId } = req.params;

    // Check if agentId is valid
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid agent ID format'
      });
    }

    const lists = await List.find({ agent: agentId }).populate('agent', 'name email mobile');

    res.status(200).json({
      success: true,
      count: lists.length,
      data: lists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all distributed lists
// @route   GET /api/lists
// @access  Private
exports.getAllLists = async (req, res) => {
  try {
    // Get all lists with agent information
    const lists = await List.find().populate('agent', 'name email mobile');

    res.status(200).json({
      success: true,
      count: lists.length,
      data: lists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Reassign list to a different agent
// @route   PUT /api/lists/:listId/reassign
// @access  Private
exports.reassignList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { agentId } = req.body;

    // Check if listId is valid
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid list ID format'
      });
    }

    // Check if agentId is valid
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid agent ID format'
      });
    }

    // Check if agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Update the list
    const updatedList = await List.findByIdAndUpdate(
      listId,
      { agent: agentId },
      { new: true }
    ).populate('agent', 'name email mobile');

    if (!updatedList) {
      return res.status(404).json({
        success: false,
        error: 'List not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete a specific list
// @route   DELETE /api/lists/:listId
// @access  Private
exports.deleteList = async (req, res) => {
  try {
    const { listId } = req.params;

    // Check if listId is valid
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid list ID format'
      });
    }

    const list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        error: 'List not found'
      });
    }

    await List.findByIdAndDelete(listId);

    res.status(200).json({
      success: true,
      data: {},
      message: 'List deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
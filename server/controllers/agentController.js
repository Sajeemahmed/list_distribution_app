const Agent = require('../models/Agent');

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private
exports.getAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select('-password');

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single agent
// @route   GET /api/agents/:id
// @access  Private
exports.getAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');

    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Create new agent
// @route   POST /api/agents
// @access  Private
exports.createAgent = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields',
      });
    }

    // Check if agent exists with this email
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({
        success: false,
        error: 'Agent with this email already exists',
      });
    }

    // Create agent
    const agent = await Agent.create({
      name,
      email,
      mobile,
      password,
    });

    res.status(201).json({
      success: true,
      data: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        mobile: agent.mobile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private
exports.updateAgent = async (req, res) => {
  try {
    let agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    // Only update fields that were actually passed
    if (req.body.name) agent.name = req.body.name;
    if (req.body.email) agent.email = req.body.email;
    if (req.body.mobile) agent.mobile = req.body.mobile;
    if (req.body.password) agent.password = req.body.password;

    await agent.save();

    res.status(200).json({
      success: true,
      data: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        mobile: agent.mobile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    await agent.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Add this function to your listController.js file

/**
 * Get all lists assigned to a specific agent
 * @route GET /api/lists/agent/:agentId
 * @access Private
 */
exports.getListsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Check if agentId is valid
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format'
      });
    }
    
    // Find all lists assigned to this agent
    const lists = await List.find({ agent: agentId })
      .populate('agent', 'name email mobile')
      .sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      data: lists
    });
  } catch (error) {
    console.error('Error fetching agent lists:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching lists'
    });
  }
};
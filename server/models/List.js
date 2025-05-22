const mongoose = require('mongoose');

const ListItemSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
});

const ListSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
  },
  items: [ListItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  fileName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('List', ListSchema);
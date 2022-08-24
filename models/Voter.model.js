const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  user: { type: String, require: true },
  votes: { type: Number, required: true },
});

module.exports = mongoose.model('Voter', voterSchema);

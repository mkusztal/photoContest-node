const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  userIp: { type: String, require: true },
  votes: { type: Array, required: true },
});

module.exports = mongoose.model('Voter', voterSchema);

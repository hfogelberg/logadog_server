// Load required packages
var mongoose = require('mongoose');

var DogSchema   = new mongoose.Schema({
  name: String,
  userId: String
});

// Export the Mongoose model
module.exports = mongoose.model('Dog', DogSchema);

// Load required packages
var User = require('../models/user');

// Create endpoint /api/login for POST
exports.postLogin = function(req, res) {
  console.log('Login');
  console.log(req.user);
  User.find({username: req.user.username}, function(err, result){
				if(err){
					res.send(JSON.stringify({err: err}));
				} else {
					res.json(result);
				}
			});
};

module.exports = function(apiRouter, models, jwt, supersecret){
	var statusCodes = require('./statusCodes');

  // test route to make sure everything is working
	apiRouter.get('/', function(req, res) {
	  res.json({ message: 'The API is alive!' });
	});

	apiRouter.route('/authenticate')
		.get(function(req, res) {
			var username =  req.query.username;
			var pwd = req.query.password;

			if ((username == "") || (password = "")) {
					res.jsons({status: statusCodes.STATUS_NO_USERNAME_OR_PASSWORD});
			}

			models.Users.findOne({
				username: username
			}).select('_id name username email password').exec(function(err, user) {
				if(err) {
					res.json({status: err.code});
					throw err;
				} else {
					if (!user) {
						console.log('Authentication. No user');
						res.json ({status: statusCodes.STATUS_USER_NOT_FOUND});
					} else if (user) {
						// Check if password matches
						console.log('Found user. Now checkikng password:' + pwd);
						var validPassword = user.comparePassword(pwd);
						if (!validPassword) {
							console.log('Authentication. Wrong password');
							res.json({status: statusCodes.STATUS_PASSWORD_WRONG});
						} else {
							// Everything OK. Create token
							var token = jwt.sign({
								name: user.name,
								username: user.username
							}, supersecret, {
								expiresIn: 1440 // expires in 24 hours
							});

							var user = {
								username: user.username,
								user_id: user._id,
								token: token
							}

							console.log(user);
							res.json({status: statusCodes.STATUS_OK, user: user});
						}
					}
				}
			});
		});

  // Sign up and create user
  apiRouter.route('/users')
    .post(function(req, res){
      var user = new models.Users({
      	name: req.body.name,
      	username: req.body.username,
      	email: req.body.email,
      	password: req.body.password
      });

      user.save(function(err, result){
				var ret = statusCodes.RET_OK;

      	if(err){
        	return res.json({status: err.code});
      	} else {
          // Create token
          var token = jwt.sign({
            name: user.name,
            username: user.username
          }, supersecret, {
            expiresInMinutes: 1440 // expires in 24 hours
          });

					console.log('User created. Token is: ' + token);
					console.log('User id: ' + result._id);

      		res.json({status: statusCodes.	STATUS_OK, userId: result._id, token: token});
      	}
      });
    });

		// test that token is provided
		apiRouter.get('/checktoken', function(req, res) {
			var token = req.body.token || req.query.token || req.headers['token'];

			if (token) {
				jwt.verify(token, supersecret, function(err, decoded) {
					// Token error
					if (err) {
						console.log('Token error');
						console.log(err);
						res.send(JSON.stringify({status: statusCodes.STATUS_TOKEN_AUTHENTICATION_FAILED}));
					} else {
						if (token) {
							console.log('Token is valid');
							res.send(JSON.stringify({status: statusCodes.STATUS_OK}));
						} else {
							console.log('Token is NOT valid');
							res.send(JSON.stringify({status: statusCodes.STATUS_TOKEN_AUTHENTICATION_FAILED}));
						}
					}
				});
			}
		});

  // middleware
	apiRouter.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
      jwt.verify(token, supersecret, function(err, decoded) {
        // Token error
        if (err) {
          console.log('Token error');
					console.log(err);
					res.send(JSON.stringify({status: statusCodes.STATUS_TOKEN_AUTHENTICATION_FAILED}));
        } else {
          console.log('Token is valid');
          req.decoded = decoded;
          next();
        }
      });
    }  else {
      // No token sent
      console.log("No token");
			res.send(JSON.stringify({status: statusCodes.STATUS_NO_TOKEN}));
    }
	});

	// *************************************************************************
	// NOTE: All functions below require a valid token
	// 			 The order in the file is important
	// *************************************************************************

  // Handle user
  apiRouter.route('/users/:user_id')
    .get(function( req, res) {
      console.log('Get user with id ' + req.params.user_id);
      models.Users.findById(req.params.user_id, function(err, user) {
        if (err)
          res.send(err);

        res.json(user);
      });
    });

	apiRouter.route('/insurance')
		.get(function(req, res) {
			var dogid = req.query.dogid;
			console.log('Get insurance', dogid);
			console.log('');
			models.Dogs.findOne({_id: dogid}, 'insurance',function(err, dog) {
				if (err) {
					res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR, message: err}))
				} else {
					console.log('Insurance', dog.insurance);
					res.send(JSON.stringify({status: statusCodes.STATUS_OK, insurance: dog.insurance}))
				}
			});
		})
		.post(function(req, res) {
			console.log('Post insurance', req.body);
			models.Dogs.findOne({_id: req.body.dogid}, function(err, dog) {
				if (err) {
					res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR, message: err}))
				} else {
					var insurance = {
						company: req.body.company,
				    product: req.body.product,
				    number: req.body.number,
				    lifeAmount: req.body.lifeAmount,
				    lifeAmount: req.body.vetAmount,
				    anualCost: req.body.anualCost,
						comment: req.body.comment,
				    renewalDate: req.body.renewalDate,
				    changed_date: req.body.changed_date
					}

					dog.insurance = insurance;

					dog.save(function (err) {
						console.log('After Saving insurance');
						if (err) {
							console.log(err);
							res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR, message: err}))
						} else {
							console.log('OK saving insurance');
							res.send(JSON.stringify({status: statusCodes.STATUS_OK}));
						}
					});
				}
			});
		});

	apiRouter.route('/identity')
		.get(function(req, res) {
			var dogid = req.query.dogid;
			console.log('Get identity', dogid);
			console.log('');
			models.Dogs.findOne({_id: dogid}, 'identity',function(err, dog) {
				if (err) {
					res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR, message: err}))
				} else {
					res.send(JSON.stringify({status: statusCodes.STATUS_OK, identity: dog.identity}))
				}
			});
		})
		.post(function(req, res) {
			models.Dogs.findOne({_id: req.body.dogid}, function(err, dog) {
				if (err) {
					res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR, message: err}))
				} else {
					var id = {
						passport: req.body.passport,
						chip: req.body.chip,
						earmark: req.body.earmark,
						comment: req.body.comment,
						changed_date: Date.now
					}

					dog.identity = id;

					dog.save(function (err) {
						console.log('After Save');
						if (err) {
							console.log(err);
							res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR, message: err}))
						} else {
							res.send(JSON.stringify({status: statusCodes.STATUS_OK}));
						}
					});
				}
			});
		});

	apiRouter.route('/appearance')
		.get(function(req, res) {
				var dogId = req.query.dogid;
				models.Dogs.findOne({_id: dogId}, 'appearance',function(err, dog) {
					if (err) {
						res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR, message: err}))
					} else {
						console.log("Fetching appearance:", dog.appearance);
						res.send(JSON.stringify({status: statusCodes.STATUS_OK, appearance: dog.appearance}))
					}
				});
		})

		.post(function( req, res) {
			console.log('Post appearance', req.body);
			models.Dogs.findOne({_id: req.body.dogId}, function(err, dog) {
				console.log("Post appearance. Dog found:", dog);
				if (err) {
					res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR, message: err}))
				} else {
					var appearance = {
						color: req.body.color,
						heightInCm: req.body.heightInCm,
						weightInKg: req.body.weightInKg,
						comment: req.body.comment,
						changed_date: Date.now()
					}

					dog.appearance = appearance;

					dog.save(function (err) {
						console.log('After Save');
						if (err) {
							console.log(err);
							res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR, message: err}))
						} else {
							res.send(JSON.stringify({status: statusCodes.STATUS_OK}));
						}
					});
				}
			});
		});

	apiRouter.route('/changedog')
		.post(function(req, res) {
			models.Dogs.findOne({_id: req.body.dogid}, function(err, dog) {
				if (err) {
					res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR, message: err}))
				} else {
					dog.name = req.body.name;
					dog.breed = req.body.breed;
					dog.gender = req.body.gender;
					dog.changed_date = Date.now();

					dog.save(function (err) {
						console.log('After Save');
						if (err) {
							console.log(err);
							res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR, message: err}))
						} else {
							console.log('OK changing dog');
							res.send(JSON.stringify({status: statusCodes.STATUS_OK}));
						}
					});
				}
			});
		});

	apiRouter.route('/dogs')
		.post(function(req, res){
			console.log('Post dog', req.body);
			var dog = new models.Dogs({
				name: req.body.name,
				breed: req.body.breed,
				gender: req.body.gender,
				user_id: req.body.user_id,
				created_date: Date.now(),
				changed_date: Date.now()
			});

			dog.save(function(err, result){
				if(err){
					res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR, message: err}));
				} else {
					res.json({status: statusCodes.STATUS_OK, dogs: result});
				}
			});
		})
		.get(function(req, res){
			// var user_id = req.params.user_id.toString();
			console.log('Get my dogs called. User Id: ' + req.params.user_id);
			models.Dogs.find({user_id: req.params.user_id}, function(err, result){
				console.log('Dogs found: ' + result.length);
        if(err){
          res.send(JSON.stringify({status: statusCodes.STATUS_DB_ERROR}));
				} else {
					console.log(result);
					res.json({status: statusCodes.STATUS_OK, dogs: result});
				}
			});
		}); // End GET dogs/:user_id
};

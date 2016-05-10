module.exports = function(apiRouter, models, jwt, supersecret){
  // test route to make sure everything is working
	apiRouter.get('/', function(req, res) {
	  res.json({ message: 'The API is alive!' });
	});

  // Sign up and create user
  apiRouter.route('/users')
    .post(function(req, res){
      console.log('Post user');
      var user = new models.Users({
      	name: req.body.name,
      	username: req.body.username,
      	email: req.body.email,
      	password: req.body.password
      });

      user.save(function(err, result){
      	if(err){
          if(err.code == 11000) {
            return res.json({success: false, message: 'A user with that user name already exists'});
          } else {
      		  res.send(JSON.stringify({err: err}));
          }
      	} else {
          // Create token
          var token = jwt.sign({
            name: user.name,
            username: user.username
          }, supersecret, {
            expiresInMinutes: 1440 // expires in 24 hours
          });

					console.log('User created. Token is: ' + token);

					var response_data = {
						user_id: result.user_id,
						token: result.token
					}

      		res.json({success: true, message: 'User created', response_data: response_data});
      	}
      });
    });

  apiRouter.route('/authenticate')
    .post(function(req, res) {
			console.log("Authenticate");

			console.log("Username: " + req.body.username);
			console.log("Password: " + req.body.password);
      models.Users.findOne({
        username: req.body.username
      }).select('_id name username email password').exec(function(err, user) {
        if(err) {
          throw err;
        } else {
          if (!user) {
						console.log('Authentication. No user');
            res.json ({
              success: false,
              message: 'Authentication failed. User not found.'
            });
          } else if (user) {
            console.log(user);

            // Check if password matches
            var validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
							console.log('Authentication. Wrong password');
              res.json({
                success: false,
                message: 'Authentication failed. Wrong password.'
              });
            } else {
              // Everything OK. Create token
              var token = jwt.sign({
                name: user.name,
                username: user.username
              }, supersecret, {
                expiresIn: 1440 // expires in 24 hours
              });

							var response_data = {
								username: user.username,
								user_id: user._id,
								token: token
							}

              res.json({
                success: true,
                message: 'Token created',
                response_data: response_data
              });
            }
          }
        }
      });
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
          return res.status(403).send({
            success: false,
            message: 'Failed to authenticate token'
          });
        } else {
          console.log('Token is valid');
          req.decoded = decoded;
          next();
        }
      });
    }  else {
      // No token sent
      console.log("No token");
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });
    }
	});

  // test that token is provided
	apiRouter.get('/checktoken', function(req, res) {
    console.log('Shoud give No token error');
	  res.json({ message: 'Token is valid' });
	});

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

	apiRouter.route('/dogs/:user_id')
		.get(function(req, res){
			// var user_id = req.params.user_id.toString();
			console.log('Get my dogs called. User Id: ' + req.params.user_id);
			models.Dogs.find({user_id: req.params.user_id}, function(err, result){
				console.log('Dogs found: ' + result.length);
        if(err){
          res.send(JSON.stringify({success: false, message: 'Error fetching dogs', err: err}));
				} else {
					console.log(result);
					res.json({success: true, message: 'OK', response_data: result});
				}
			});
		}) // End GET dogs/:user_id

		.post(function(req, res){
			console.log('Post dog', req.body);
			var dog = new models.Dogs({
				name: req.body.name,
				breed: req.body.breed,
        user_id: req.body.user_id,
        created_date: Date.now(),
        changed_date: Date.now()
			});

			dog.save(function(err, result){
				if(err){
					res.send(JSON.stringify({success: false, message: 'Error saving new dog', err: err}));
				} else {
					res.json({success: true, message: 'OK', response_data: result});
				}
			});
		});		// End POST dogs/:user_id
};

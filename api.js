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
      		res.json({message: result});
      	}
      });
    });

  apiRouter.route('/authenticate')
    .post(function(req, res) {
      models.Users.findOne({
        username: req.body.username
      }).select('name username email password').exec(function(err, user) {
        if(err) {
          throw err;
        } else {
          if (!user) {
            res.json ({
              success: false,
              message: 'Authentication failed. User not found.'
            });
          } else if (user) {
            console.log(user);

            // Check if password matches
            var validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
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
                expiresInMinutes: 1440 // expires in 24 hours
              });

              res.json({
                success: true,
                message: 'Token created',
                username: user.username,
                user_id: user._id,
                token: token
              });
            }
          }
        }
      });
    });

  // middleware
	apiRouter.use(function(req, res, next) {
	  console.log('API middleware called ' + req.body);

    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, supersecret, function(err, decoded) {
        // Token error
        if (err) {
          console.log('Token error');
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

	apiRouter.route('/dogs')
		.get(function(req, res){
			console.log('Get my dogs called ' + req.body);
			models.Dogs.find({user_id: req.body.user_id}, function(err, result){
        if(err){
          res.send(JSON.stringify({err: err}));
				} else {
					res.json(result);
				}
			});
		})
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
				res.send(JSON.stringify({err: err}));
			} else {
				res.json({message: result});
			}
		});
	});
};

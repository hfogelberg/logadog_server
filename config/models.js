module.exports = function(mongoose, bcrypt) {
  var AppearanceSchema = new mongoose.Schema({
      color: String,
      color: String,
      heightInCm: String,
      weightInKg: String
    });

  var UserSchema = new mongoose.Schema({
    name: String,
    email: {type: String, required:  true, index: {unique: true}},
    username: {type: String, required:  true, index: {unique: true}},
    password: {type: String, required: true, select: false},
    appearance: AppearanceSchema
  });

  var Dog = new mongoose.Schema({
    name: String,
    breed: String,
    user_id: String,
    created_date: Date,
    changed_date: Date
  });

  UserSchema.pre('save', function(next) {
		var user = this;

		if(!user.isModified('password'))
			return next();

		bcrypt.hash(user.password, null, null, function(err, hash) {
			if(err)
				return next(err);

			user.password = hash;
			next();
		});
	});

	UserSchema.methods.comparePassword = function(password) {
    console.log('comparePassword');
		var user = this;

		return bcrypt.compareSync(password, user.password);
	};

  var models = {
		Users: mongoose.model('Users', UserSchema),
    Dogs: mongoose.model('Dogs', Dog)
  };

 return models;
}

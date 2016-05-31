module.exports = function(mongoose, bcrypt) {
  var UserSchema = new mongoose.Schema({
    name: String,
    email: {type: String, required:  true, index: {unique: true}},
    username: {type: String, required:  true, index: {unique: true}},
    password: {type: String, required: true, select: false}
  });

  var AppearanceSchema = new mongoose.Schema({
    color: String,
    heightInCm: String,
    weightInKg: String,
    comment: String,
    changed_date: String
  })

  var IdSchema = new mongoose.Schema({
    passport: String,
    chip: String,
    earmark: String,
    marks: String,
    comment: String,
    changed_date: String
  })

  var Dog = new mongoose.Schema({
    name: String,
    breed: String,
    dogComment: String,
    gender: String,
    appearance: AppearanceSchema,
    identity: IdSchema,
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
    console.log('Compare Password: ' + password);
		var user = this;
    console.log('');

    var compare = bcrypt.compareSync(password, user.password);
    return compare
	};

  var models = {
		Users: mongoose.model('Users', UserSchema),
    Dogs: mongoose.model('Dogs', Dog)
  };

 return models;
}

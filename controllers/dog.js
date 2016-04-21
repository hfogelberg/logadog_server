// Load required packages
var Dog = require('../models/dog');

// Create endpoint /api/beers for POST
exports.postDogs = function(req, res) {
  var dog = new Dog();

  dog.name = req.body.name;
  dog.userId = req.user._id;

  dog.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'New dog added!', data: dog });
  });
};

// Create endpoint /api/dogs for GET
exports.getDogs = function(req, res) {
  Dog.find({ userId: req.user._id }, function(err, dogs) {
    if (err)
      res.send(err);

    res.json(dogs);
  });
};

// Create endpoint /api/dogs/:dog_id for GET
exports.getDog = function(req, res) {
  Dog.find({ userId: req.user._id, _id: req.params.dog_id }, function(err, dog) {
    if (err)
      res.send(err);

    res.json(dog);
  });
};

// Create endpoint /api/dogs/:dog_id for PUT
exports.putDog = function(req, res) {
  Dog.update({ userId: req.user._id, _id: req.params.dog_id }, { name: req.body.name }, function(err, num, raw) {
    if (err)
      res.send(err);

    res.json({ message: num + ' updated' });
  });
};

// Create endpoint /api/beers/:beer_id for DELETE
exports.deleteDog = function(req, res) {
  Dog.remove({ userId: req.user._id, _id: req.params.dog_id }, function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'Dog removed!' });
  });
};

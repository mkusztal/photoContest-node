const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');
const requestIp = require('request-ip');
const { find } = require('../models/photo.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if (title && author && email && file) {
      // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];

      if ((fileExt === '.jpg' || '.gif' || '.png') && title.length <= 25) {
        const newPhoto = new Photo({
          title,
          author,
          email,
          src: fileName,
          votes: 0,
        });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error('Wrong type of image!');
      }
    } else {
      throw new Error('Wrong input!');
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const clientIp = requestIp.getClientIp(req);
    const findUser = await Voter.findOne({ userIp: clientIp });
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });

    if (findUser) {
      const findVote = findUser.votes.includes(photoToUpdate._id);
      if (findVote) {
        return res.status(404).json({ message: 'User voted' });
      }
      photoToUpdate.votes++;
      await photoToUpdate.save();
      findUser.votes.push(photoToUpdate._id);
      await findUser.save();
      return res.send({ message: 'OK' });
    }
    const newVoter = new Voter({
      userIp: clientIp,
      votes: [photoToUpdate._id],
    });
    await newVoter.save();
    photoToUpdate.votes++;
    await photoToUpdate.save();
    res.send({ message: 'OK' });
  } catch (err) {
    res.status(500).json(err);
  }
};

// errors: {votes: {stringValue: ""63037b7f6c63292703b99e05"", valueType: "ObjectID", kind: "Number",…}}
// message: "Voter validation failed: votes: Cast to Number failed for value \"63037b7f6c63292703b99e05\" (type ObjectID) at path \"votes\""
// name: "ValidationError"
// _message: "Voter validation failed"

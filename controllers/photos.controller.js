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
    const clientIP = requestIp.getClientIp(req);
    const findUser = await Voter.findOne({ user: clientIP });
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });

    if (findUser) {
      if (findUser.votes.includes(photoToUpdate._id)) {
        console.log('User voted ');
        res.status(500).json(err);
      } else {
        photoToUpdate.votes++;
        await photoToUpdate.save();
        findUser.votes.push(photoToUpdate._id);
        await findUser.save();
        res.send({ message: 'OK' });
      }
    } else {
      const newVoter = new Voter({ user: clientIP, votes: photoToUpdate._id });
      await newVoter.save();
      photoToUpdate.votes++;
      await photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

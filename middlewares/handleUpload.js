// middlewares/handleUpload.js
const upload = require('./multer'); // your multer config

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send('File is too large. Max size is 5MB.');
      }
      return res.status(500).send('File upload failed.');
    }
    next();
  });
};

module.exports = handleUpload;

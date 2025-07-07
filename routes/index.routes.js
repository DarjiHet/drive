const express = require('express');
const authMiddleware = require('../middlewares/authe')
const upload = require('../middlewares/multer');
const handleUpload = require('../middlewares/handleUpload');
const router = express.Router();
const fileModel = require('../models/files.model')
const { cloudinary } = require('../config/cloudinary');


router.get('/home', authMiddleware, async (req, res) => {
    const files = await fileModel.find({ user: req.user.userId });
    res.render('home', { files });
});

router.get('/', async (req, res) => {

    const token = req.cookies.token;

    if (!token) {
        // No token, show register page
        return res.render('register');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const files = await fileModel.find({ user: decoded.userId });
        return res.render('home', { files });
    } catch (err) {
        // Invalid token, show register page
        return res.render('register');
    }
})


router.post('/upload-file', authMiddleware, handleUpload, async (req, res) => {
    try {

        const { path, originalname, filename } = req.file;

        // console.log('Uploaded file:', req.file);

        const newFile = await fileModel.create({
            path,
            originalname,
            public_id: filename,
            user: req.user.userId,
        });

        res.redirect('/home');
    } catch (err) {
        res.status(500).send('Something went wrong while saving the file.');
    }
});

router.get('/download/:path', authMiddleware, async (req, res) => {

    const { path } = req.params;
    const file = await fileModel.findOne({ user: req.user.userId, path });

    if (!file) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    res.redirect(file.path);
})




router.get('/delete/:id', authMiddleware, async (req, res) => {
    const file = await fileModel.findOne({
        _id: req.params.id,
        user: req.user.userId
    });

    if (!file) {
        return res.status(404).json({ message: 'File not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.public_id);

    // Delete from MongoDB
    await fileModel.deleteOne({ _id: req.params.id });

    res.redirect('/home');
});



module.exports = router;
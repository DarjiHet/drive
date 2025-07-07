const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator')
const userModel = require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fileModel = require('../models/files.model')


router.get('/register', (req, res) => {
    res.render('register');
})

router.post('/register',
    body('email').trim().isEmail().isLength({ min: 13 }),
    body('password').trim().isLength({ min: 5 }),
    body('username').trim().isLength({ min: 3 }),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: "Invalid data"
            })
        }

        // console.log(req.body)
        // res.send(errors);

        try {

            const { email, username, password } = req.body;


            const hashPassword = await bcrypt.hash(password, 10)

            const newUser = await userModel.create({
                email,
                username,
                password: hashPassword,
            })

            // res.json(newUser)

            const token = jwt.sign({
                userId: newUser._id,
                email: newUser.email,
                username: newUser.username
            }, process.env.JWT_SECRET);

            res.cookie('token', token);

            res.redirect('/home');

        } catch (err) {
            res.send(err.errmsg);
        }

    })


router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login',
    body('email').trim().isEmail().isLength({ min: 13 }),
    body('password').trim().isLength({ min: 5 }),
    async (req, res) => {

        try {

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: errors.array(),
                    message: 'Invalid data'
                })
            }

            const { email, password } = req.body;

            const user = await userModel.findOne({
                email: email
            })

            if (!user) {
                return res.status(400).json({
                    message: 'username or password is incorrect'
                })
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                return res.status(400).json({
                    message: 'username or password is incorrect'
                })
            }

            const token = jwt.sign({
                userId: user._id,
                email: user.email,
                username: user.username
            },
                process.env.JWT_SECRET,
            )

            res.cookie('token', token)

            // res.send('logged in')
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const files = await fileModel.find({ user: decoded.userId });

            res.redirect('/home');

        } catch (err) {
            res.send(err)
        }
    }
)


module.exports = router;
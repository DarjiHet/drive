const dotenv = require('dotenv');

dotenv.config();

const express = require('express');
const userRouter  = require('./routes/user.routes')
const indexRouter = require('./routes/index.routes')

const connectToDB = require('./config/db');
connectToDB();
const cookieParser = require('cookie-parser');
const app = express();

app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/', indexRouter)
app.use('/user', userRouter)

process.on('uncaughtException', (err) => {
    console.log('uncaughtException');
    console.log(err)
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})
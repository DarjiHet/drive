const mongoose = require('mongoose');

function connectToDB(){
    mongoose.connect(process.env.MONGO_URL).then(() => {
        console.log('connected to DB')
    })
}

module.exports = connectToDB;
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');


const route = require('./routes/route');

const app = express();


app.use(bodyParser.json());
app.use(multer().any());



const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://sagar123singh:ds@cluster0.oye0t.mongodb.net/newData?authSource=admin&replicaSet=atlas-gyucxl-shard-0&readPreference=primary&ssl=true",
    { useNewUrlParser: true, useUnifiedTopology: true })

    .then(() => console.log("connected to mongodb"))
    .catch((err) => console.log(err))
app.use('/', route);


app.listen(process.env.PORT || 4000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 4000))
});



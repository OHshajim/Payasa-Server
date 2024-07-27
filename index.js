const express = require("express");
const cors = require("cors");
require('dotenv').config();
const bodyParser = require('body-parser')
require('./Models/db')
const Authentication = require('./Router/Authentication')
const app = express();
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())
app.use('/authentication',Authentication)


// server running test 
app.get('/', (req, res) => {
    res.send('Payasa server running ...')
})

app.listen(port, () => {
    console.log(`Payasa server listening on port ${port}`)
})
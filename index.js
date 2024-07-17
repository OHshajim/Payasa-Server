const express = require("express");
const cors = require("cors");
require('dotenv').config();
require('./Models/db')
const app = express();
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());




// server running test
app.get('/', (req, res) => {
    res.send('Payasa server running ...')
})

app.listen(port, () => {
    console.log(`Payasa server listening on port ${port}`)
})
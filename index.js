const express = require('express');
require('dotenv').config();
const bodyParser = require("body-parser");
const routeClient = require('./routes/index.route');
const database = require('./config/database');
database.connect();

const app = express();
const port = process.env.PORT;

//parse application/json
app.use(bodyParser.json());

//Route
routeClient(app);

app.listen(port, () => {~
  console.log(`Server is running at http://localhost:${port}`);
});
const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser');
require('dotenv').config();
const bodyParser = require("body-parser");
const routeClient = require('./routes/index.route');
const database = require('./config/database');
database.connect();

const app = express();
const port = process.env.PORT;

// Enable CORS for cross-origin requests
app.use(cors())

// Cookie parser
app.use(cookieParser());

//parse application/json
app.use(bodyParser.json());

//Route
routeClient(app);

app.listen(port, () => {~
  console.log(`Server is running at http://localhost:${port}`);
});
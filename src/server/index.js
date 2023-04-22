'use strict';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();
const { SERVER_PORT } = process.env;

import express from 'express';
import morgan from 'morgan';

const app = express();

app.use(morgan('tiny')); // Set up logging :)

app.get('/', (req, res) => {
    res.json({'hello': 'world!'});
});

import gamelogic from './gamelogic.js';
gamelogic(app);

app.listen(SERVER_PORT, () => {
    console.log(`Server running on http://localhost:${SERVER_PORT} :)`);
});


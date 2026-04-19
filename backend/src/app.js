const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: false }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

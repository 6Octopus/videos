const express = require('express');
const parser = require('body-parser');

const router = require('./routes.js');

const app = express();

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use('/', router);

const port = process.env.PORT || 3000;
app.listen(port);

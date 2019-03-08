require('dotenv').config();

const express = require('express');

const db = require('../data/dbConfig');

const server = express();

server.use(express.json());

module.exports = server;
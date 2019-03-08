require('dotenv').config();

const express = require('express');

const db = require('../data/dbConfig');

const server = express();

server.use(express.json());

server.get('/', (req, res) => {
    res.status(200).json({ message: "Server working" });
});

module.exports = server;
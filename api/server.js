require('dotenv').config();

const express = require('express');

const db = require('../data/dbConfig');

const server = express();

server.use(express.json());

server.get('/', (req, res) => {
    res.status(200).json({ message: "Server working" });
});

server.post('/games', async (req, res) => {
    let { title, genre, releaseYear } = req.body;
    const game = { title, genre, releaseYear };
    if (!title || !genre) {
        res.status(422).json({message: 'Title and Genre required'})
    } else {
        try {
            const count = await db('games').insert(game);
            res.status(201).json({ count });
    
        } catch (err) {
            res.status(500).json(err)
        }
    }
});

module.exports = server;
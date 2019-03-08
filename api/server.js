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
        const dupTitle = await db('games').select('title').where('title', '=', title).first();
        if (dupTitle) {
            res.status(405).json({message: 'Title must be unique'})
        } else {
            try {
                const count = await db('games').insert(game);
                res.status(201).json({ count });
            } catch (err) {
                res.status(500).json(err)
            }
        }
    }
});

server.get('/games', async (req, res) => {
    try {
        const games = await db('games');
        res.status(200).json(games);
    } catch (err) {
        res.status(500).json(err)
    }
});

server.get('/games/:id', async (req, res) => {
    const games = await db('games').where('id', '=', req.params.id);
    if (games.length === 0) {
        res.status(404).json({message: 'Game by specified ID does not exist'})
    } else {
        try {
            const game = await db('games').where('id', '=', req.params.id).first();
            res.status(200).json(game);
        } catch (err) {
            res.status(500).json(err)
        }
    }
});

module.exports = server;
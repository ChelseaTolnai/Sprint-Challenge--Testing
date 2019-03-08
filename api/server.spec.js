const request = require('supertest');

const db = require('../data/dbConfig');
const server = require('./server.js');

describe('server.js', () => {

    it('should set testing environment', () => {
        expect(process.env.DB_ENV).toBe('testing');
    });

    describe('GET /', () => {

        let res;

        beforeEach(async () => {
            res = await request(server).get('/')
            return res;
        })

        it('If successful, returns status 200', async () => {
            expect(res.status).toBe(200);
        });

        it('If successful, returns JSON', async () => {
            expect(res.type).toBe('application/json');
        });

        it('If successful, returns correct message', async () => {
            expect(res.body).toEqual({ message: "Server working" });
        });

    });

    describe('POST /games', () => {

        const game = {
            title: 'Pacman',
            genre: 'Arcade',
            releaseYear: 1980
        }

        let res;

        beforeEach(async () => {
            await db('games').truncate();
            res = await request(server).post('/games').send(game)
            return res;
        })

        it('If successful, returns status 201', async () => {
            expect(res.status).toBe(201);
        });

        it('If successful, returns JSON', async () => {
            expect(res.type).toBe('application/json');
        });

        it('If successful, inserts game into db and returns added game', async () => {
            expect(res.body.count).toEqual([1]);
        });

    });

});
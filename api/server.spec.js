const request = require('supertest');

const db = require('../data/dbConfig');
const server = require('./server.js');

describe('server.js', () => {

    it('should set testing environment', () => {
        expect(process.env.DB_ENV).toBe('testing');
    });

    describe('GET /', async () => {
        const res = await request(server).get('/');

        it('If successful, returns status 200', async () => {
            expect(res.status).toBe(200);
        });

        it('If successful, returns JSON', async () => {
            expect(res.type).toBe('application/json');
        });

        it('If successful, returns JSON', async () => {
            expect(res.body).toEqual({ message: "Server working" });
        });

    });

});
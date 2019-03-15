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

        const gameSuccess = {
            title: 'Pacman',
            genre: 'Arcade',
            releaseYear: 1980
        }

        let res;

        beforeEach(async () => {
            await db('games').truncate();
            res = await request(server).post('/games').send(gameSuccess)
            return res;
        })

        it('If successful, returns status 201', async () => {
            expect(res.status).toBe(201);
        });

        it('If successful, returns JSON', async () => {
            expect(res.type).toBe('application/json');
        });

        it('If successful, inserts game into db and returns count of games added', async () => {
            expect(res.body.count).toEqual([1]);
        });

        it('Returns status 422 if information incomplete in request', async () => {
            await db('games').truncate();
            const gameFail = {
                title: 'Pacman',
                releaseYear: 1980
            }
            const resFail = await request(server).post('/games').send(gameFail)
            expect(resFail.status).toBe(422);
            expect(resFail.body.message).toBe('Title and Genre required')
        });

        it('Returns status 405 if request title is not unique', async () => {
            const gameDupTitle = {
                title: 'Pacman',
                genre: 'Arcade Game',
                releaseYear: 1989
            }

            const dupTitle = await db('games').select('title').where('title', '=', gameDupTitle.title).first();
            expect(dupTitle.title).toBe(gameDupTitle.title);

            const resFail = await request(server).post('/games').send(gameDupTitle)
            expect(resFail.status).toBe(405);
            expect(resFail.body.message).toBe('Title must be unique');
        });

    });

    describe('GET /games', () => {

        const games = [
            { title: 'Pacman', genre: 'Arcade', releaseYear: 1980 },
            { title: 'Super Mario Bros', genre: 'Arcade' },
            { title: 'Ms. Pacman', genre: 'Arcade' }
        ]

        beforeEach(async () => {
            await db('games').truncate();
            await db('games').insert(games.map(game => game));
        })

        it('If successful, returns status 200', async () => {
            const res = await request(server).get('/games');
            expect(res.status).toBe(200);
        });

        it('If successful, returns JSON', async () => {
            const res = await request(server).get('/games');
            expect(res.type).toBe('application/json');
        });

        it('If successful, returns array of games', async () => {
            const res = await request(server).get('/games');
            expect(res.body).toHaveLength(3);
            expect(res.body[1].title).toEqual(games[1].title);
            expect(res.body[1].genre).toEqual(games[1].genre);
            expect(res.body[1].releaseYear).toBeNull();
        });

        it('Returns empty array if no games in db', async () => {
            await db('games').truncate();
            const resEmpty = await request(server).get('/games')
            expect(resEmpty.body).toEqual([]);
        });

    });

    describe('GET /games/:id', () => {

        const games = [
            { title: 'Pacman', genre: 'Arcade', releaseYear: 1980 },
            { title: 'Super Mario Bros', genre: 'Arcade' },
            { title: 'Ms. Pacman', genre: 'Arcade' }
        ]

        const id = 1;

        beforeEach(async () => {
            await db('games').truncate();
            await db('games').insert(games.map(game => game));
        })

        it('If successful, returns status 200', async () => {
            const res = await request(server).get(`/games/${id}`);
            expect(res.status).toBe(200);
        });

        it('If successful, returns JSON', async () => {
            const res = await request(server).get(`/games/${id}`);
            expect(res.type).toBe('application/json');
        });

        it('If successful, returns game of specified ID', async () => {
            const res = await request(server).get(`/games/${id}`);
            expect(res.body).toBeDefined();
            expect(res.body.id).toBe(id);
            expect(res.body.title).toBe(games[id - 1].title); // id-1 because primary keys increments start at 1 not 0 (index)
            expect(res.body.genre).toBe(games[id - 1].genre); // id-1 because primary keys increments start at 1 not 0 (index)
        });

        it('Returns status 404 if game by specified ID does not exist', async () => {
            let nonID = 6;
            const noID = await db('games').where('id', '=', nonID).first();
            expect(noID).toBeUndefined();

            const resFail = await request(server).get(`/games/${nonID}`);
            expect(resFail.status).toBe(404);
            expect(resFail.body.message).toBe('Game by specified ID does not exist');
        });

    });

    describe('DELETE /games/:id', () => {

        const games = [
            { title: 'Pacman', genre: 'Arcade', releaseYear: 1980 },
            { title: 'Super Mario Bros', genre: 'Arcade' },
            { title: 'Ms. Pacman', genre: 'Arcade' }
        ]

        const id = 2;

        beforeEach(async () => {
            await db('games').truncate();
            await db('games').insert(games.map(game => game));
        })

        it('If successful, returns status 200', async () => {
            const res = await request(server).delete(`/games/${id}`);
            expect(res.status).toBe(200);
        });

        it('If successful, returns JSON', async () => {
            const res = await request(server).delete(`/games/${id}`);
            expect(res.type).toBe('application/json');
        });

        it('If successful, deletes game from db and returns successful message', async () => {
            let games = await db('games');
            expect(games).toHaveLength(3);

            const res = await request(server).delete(`/games/${id}`);
            expect(res.body.message).toBe('Game deleted');

            const deleted = await db('games').where('id', '=', id).first();
            expect(deleted).toBeUndefined();

            games = await db('games');
            expect(games).toHaveLength(2);
        });

        it('Returns status 404 if game by specified ID does not exist', async () => {
            let nonID = 6;
            const noID = await db('games').where('id', '=', nonID).first();
            expect(noID).toBeUndefined;

            const resFail = await request(server).delete(`/games/${nonID}`);
            expect(resFail.status).toBe(404);
            expect(resFail.body.message).toBe('Game by specified ID does not exist');
        });
    });
});
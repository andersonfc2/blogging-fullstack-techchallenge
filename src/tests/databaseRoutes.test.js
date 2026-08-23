const request = require('supertest');
const pool = require('../config/database');
const app = require('../app');

jest.mock('../config/database', () => ({
    query: jest.fn(),
}));

describe('Database health endpoint', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns a message that the database is connected', async () => {
        const now = '2026-08-23T12:00:00.000Z';
        pool.query.mockResolvedValue({ rows: [{ now }] });

        const response = await request(app).get('/database/health');

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            status: 'ok',
            message: 'Banco de dados conectado com sucesso',
            databaseTime: now,
        });
    });
});

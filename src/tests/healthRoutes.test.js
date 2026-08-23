const request = require('supertest');
const app = require('../app');

describe('Health endpoint', () => {
    it('returns a message that the API is working', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            status: 'ok',
            message: 'API funcionando corretamente',
        });
    });
});

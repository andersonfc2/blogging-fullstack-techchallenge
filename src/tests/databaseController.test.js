const pool = require('../config/database');
const { checkDatabaseConnection } = require('../controllers/databaseController');

jest.mock('../config/database', () => ({
    query: jest.fn(),
}));

function mockResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
}

describe('DatabaseController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns ok when the database responds', async () => {
        const now = new Date('2026-08-23T12:00:00.000Z');
        pool.query.mockResolvedValue({ rows: [{ now }] });
        const res = mockResponse();

        await checkDatabaseConnection({}, res);

        expect(pool.query).toHaveBeenCalledWith('SELECT NOW()');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: 'ok',
            message: 'Banco de dados conectado com sucesso',
            databaseTime: now,
        });
    });

    it('returns error when the database query fails', async () => {
        pool.query.mockRejectedValue(new Error('connection failed'));
        const res = mockResponse();

        await checkDatabaseConnection({}, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Erro ao conectar no banco de dados',
        });
    });
});

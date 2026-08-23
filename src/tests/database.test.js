const mockQuery = jest.fn();

jest.mock('pg', () => ({
    Pool: jest.fn(() => ({
        query: mockQuery,
    })),
}));

describe('database configuration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('exports initDatabase without connecting during import', () => {
        const pool = require('../config/database');

        expect(pool.initDatabase).toEqual(expect.any(Function));
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it('creates the posts table when initDatabase is called', async () => {
        const pool = require('../config/database');
        mockQuery.mockResolvedValue({ rows: [] });

        await pool.initDatabase(1, 0);

        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery.mock.calls[0][0]).toContain('CREATE TABLE IF NOT EXISTS posts');
    });
});

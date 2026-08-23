//Testa o controller da database e sua conexão
//Atividade ID 28

describe("Tests the database connection", () => {
    it("should return an error from an empty request", async () => {
        req = {};
        res = {
        status: function(responseStatus) {
            expect(responseStatus).toBe(500);
            return this; 
        },
        json: function(responseError) {
            expect(responseError).toStrictEqual({
                status: 'error',
                message: 'Erro ao conectar no banco de dados',
            })
        }};
    });

    it("should return an error from a bogus request", async () => {
        req = {query: 3495384534};
        res = {
        status: function(responseStatus) {
            expect(responseStatus).toBe(500);
            return this; 
        },
        json: function(responseError) {
            expect(responseError).toStrictEqual({
                status: 'error',
                message: 'Erro ao conectar no banco de dados',
            })
        }};
    });

    it("should verify the connection with the database and return all rows", async () => {
        req = {query: 'a'};
        res = {
        status: function(responseStatus) {
            expect(responseStatus).toBe(200);
            return this; 
        },
        json: function(responseDatabase) {
            expect(responseDatabase).toStrictEqual({
                status: 'ok',
                message: 'Banco de dados conectado com sucesso',
                databaseTime: result.rows[0].now,
            })
        }};
    });
});
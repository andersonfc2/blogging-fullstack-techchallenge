//Atividade ID 28
//Testes para 20% de cobertura

const pool = require('../config/database');


describe("Tests the database connection", () => {
    it("should return a fatal error message due to a lack of parameters", async () => {
        expect(() => {
            initDatabase();
            expect(console.error).toHaveBeenCalled(1);
            expect(console.error).toBe(' Erro fatal ao criar a tabela "posts":');
        }).toThrow();
    });
});
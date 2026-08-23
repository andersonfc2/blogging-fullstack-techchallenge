//Testa a rota /health
//Atividade ID 24

const { getHealth } = require('../controllers/healthController');

test('Should obtain a confirmation status from a GET to the health route', () => {
    var req, res;

    req = {};
    res = {
        status: function(responseStatus) {
            expect(responseStatus).toBe(200);
            return this; 
        },
        json: function(responseString) {
            expect(responseString).toStrictEqual({"message": "API funcionando corretamente", "status":"ok"})
        }
    };
    getHealth(req,res);
});
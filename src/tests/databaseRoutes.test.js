const { checkDatabaseConnection } = require('../controllers/databaseController');

const request = require("supertest");
const express = require("express");
const app = express();


const router = express.Router();


var req, res;

describe('Database health endpoint', () => {
    it('should return a message that the API is working', async () => {
        router.get('/database/health', checkDatabaseConnection);
        res = {
            status: function(responseStatus) {
                expect(responseStatus).toBe(200);
                return this; 
            },
            json: function(responseString) {
                expect(responseString).toStrictEqual({
                    status: 'ok',
                    message: 'Banco de dados conectado com sucesso',
                    databaseTime: result.rows[0].now,
                })
            }
        };
    })
})
const healthRoutes = require("../routes/healthRoutes");
const { getHealth } = require('../controllers/healthController');


const request = require("supertest");
const express = require("express");
const app = express();


const router = express.Router();


var req, res;

describe('Health endpoint', () => {
    it('should return a message that the API is working', async () => {
        router.get('/health', getHealth);
        res = {
            status: function(responseStatus) {
                expect(responseStatus).toBe(200);
                return this; 
            },
            json: function(responseString){
                expect(responseString).toStrictEqual({"message": "API funcionando corretamente", "status":"ok"})
            }
        };
    })
})
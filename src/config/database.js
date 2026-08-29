const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// 23/06 w CRIA TABELA SE ELA NAO EXISTIR
async function initDatabase(retries = 5, delay = 2000) {
    const queryText = `
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            author VARCHAR(255),
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS teachers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            "passwordHash" VARCHAR(255) NOT NULL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    for (let i = 1; i <= retries; i++) {
        try {
            await pool.query(queryText);

            const teacherEmail = process.env.TEACHER_EMAIL;
            const teacherPassword = process.env.TEACHER_PASSWORD;
            const teacherName = process.env.TEACHER_NAME || 'Professor Admin';

            if (teacherEmail && teacherPassword) {
                const existingTeacher = await pool.query(
                    'SELECT id FROM teachers WHERE email = $1',
                    [teacherEmail]
                );

                if (existingTeacher.rows.length === 0) {
                    const passwordHash = await bcrypt.hash(teacherPassword, 10);

                    await pool.query(
                        'INSERT INTO teachers(name, email, "passwordHash") VALUES($1, $2, $3)',
                        [teacherName, teacherEmail, passwordHash]
                    );

                    console.log('Professor padrão criado com sucesso!');
                }
            }

            console.log('Tabela "posts" verificada/criada com sucesso!');
            return; 
        } catch (error) {
            if (error.code === 'ECONNREFUSED' && i < retries) {
                console.log(`⏳ Banco de dados inicializando. Tentativa ${i}/${retries} falhou. Aguardando ${delay / 1000}s...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                console.error(' Erro fatal ao criar a tabela "posts":');
                throw error;
            }
        }
    }
}

module.exports = pool;
module.exports.initDatabase = initDatabase;

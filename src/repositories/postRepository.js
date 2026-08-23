//IMPORTA CONEXAO COM O BANCO
const pool = require('../config/database');

class PostRepository {

    //METODO PARA SALVAR UM POST NO POSTGRESQL
    async create({ title, content, author }) {
        console.log("arg:",{ title,content,author}); //debug
        const queryText = `
            INSERT INTO posts(title,content,author)
            VALUES($1,$2,$3)
            RETURNING *;        
        `;
        const values = [title, content, author];
        const { rows } = await pool.query(queryText, values);
        return rows[0];
    }

    //METODO PARA BUSCAR TODOS ORDENADO POR DATA DE CRIACAO DECRESC
    async findAll() {
        const queryText = 'SELECT * FROM posts ORDER BY "createdAt" DESC;';
        const { rows } = await pool.query(queryText);
        return rows;
    }

    //METODO PARA BUSCAR POR PALAVRA-CHAVE
    async searchPosts(term) {
        // ILIKE para busca case-insensitive
        const query = `
        SELECT * FROM posts 
        WHERE title ILIKE $1 OR content ILIKE $1
        ORDER BY "createdAt" DESC;
      `;
        // O % permite buscar o termo no início, meio ou fim da string
        const searchTerm = `%${term}%`;
        const result = await pool.query(query, [searchTerm]);
        return result.rows;
    }

    

    //METODO DE BUSCA POR ID UNICO
    async findById(id) {
        const queryText = 'SELECT * FROM posts WHERE id = $1';
        const { rows } = await pool.query(queryText, [id]);
        return rows[0] || null;
    }

    // METODO PARA ATUALIZAR
    async update(id, { title, content, author }) {
        const queryText = `
        UPDATE posts
         SET title = $1, content = $2, author = $3, "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $4
        RETURNING *;
        `;
        const values = [title, content, author, id];
        const { rows } = await pool.query(queryText, values);
        return rows[0] || null;
    }

    // METODO PARA DELETAR POR ID
    async delete(id) {
        const queryText = 'DELETE FROM posts WHERE id = $1 RETURNING *;';
        const { rows } = await pool.query(queryText, [id]);
        return rows.length > 0;
    }
}

//INSTANCIA UNICA CONSUMIDA NO CONTROLLER
module.exports = new PostRepository();
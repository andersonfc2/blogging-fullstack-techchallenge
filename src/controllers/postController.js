const postRepository = require('../repositories/postRepository');
//const { searchPosts } = require('../repositories/postRepository');

class PostController {
    //POST
    async create(req, res) {
        try {
            console.log("reqbody:", req.body); //debug
            const { title, content, author } = req.body;
            if (!title || !content || !author) {
                return res.status(400).json({ error: 'Campos obrigatórios ausentes: title, content e author.' });
            }
            const newPost = await postRepository.create({ title, content, author });
            return res.status(201).json(newPost);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao criar post.' });
        }
    }

    // GET
    async list(req, res) {
        try {
            const posts = await postRepository.findAll();
            return res.status(200).json(posts);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar posts.' });
        }
    }

    //GET BY KEY-WORD
    async search(req, res) {
        const { term } = req.query;

        if (!term) {
            return res.status(400).json({ error: "O termo de busca é obrigatório." });
        }

        try {
            const posts = await postRepository.searchPosts(term);
            res.json(posts);
        } catch (error) {
            console.error("Erro ao buscar posts:", error);
            res.status(500).json({ error: error.message, stack: error.stack });
        }
    }

    // GET by ID
    async getById(req, res) {
        try {
            const post = await postRepository.findById(req.params.id);
            if (!post) return res.status(404).json({ error: 'Post não encontrado.' });
            return res.status(200).json(post);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar post.' });
        }
    }

    

    // PUT 
    async update(req, res) {
        try {
            const { title, content, author } = req.body;
            const updated = await postRepository.update(req.params.id, { title, content, author });
            if (!updated) return res.status(404).json({ error: 'Post não encontrado.' });
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar post.' });
        }
    }

    // DELETE 
    async delete(req, res) {
        try {
            const success = await postRepository.delete(req.params.id);
            if (!success) return res.status(404).json({ error: 'Post não encontrado.' });
            return res.status(200).json({ message: 'Post deletado com sucesso.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar post.' });
        }
    }
}

module.exports = new PostController();
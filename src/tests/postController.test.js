const postController = require('../controllers/postController');
const postRepository = require('../repositories/postRepository');

jest.mock('../repositories/postRepository', () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    searchPosts: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
}));

function mockResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
}

describe('PostController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates a post when required fields are present', async () => {
        const req = {
            body: {
                title: 'Paragraphs',
                content: 'A book about words.',
                author: 'John Doe',
            },
        };
        const res = mockResponse();
        const createdPost = { id: 1, ...req.body };
        postRepository.create.mockResolvedValue(createdPost);

        await postController.create(req, res);

        expect(postRepository.create).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdPost);
    });

    it('rejects post creation without required fields', async () => {
        const req = { body: { title: 'Only title' } };
        const res = mockResponse();

        await postController.create(req, res);

        expect(postRepository.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Campos obrigatórios ausentes: title, content e author.',
        });
    });

    it('lists all posts', async () => {
        const posts = [{ id: 1, title: 'Title', content: 'Content', author: 'Author' }];
        postRepository.findAll.mockResolvedValue(posts);
        const res = mockResponse();

        await postController.list({}, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(posts);
    });

    it('searches posts by term', async () => {
        const posts = [{ id: 1, title: 'Node', content: 'Express', author: 'Teacher' }];
        postRepository.searchPosts.mockResolvedValue(posts);
        const res = mockResponse();

        await postController.search({ query: { term: 'node' } }, res);

        expect(postRepository.searchPosts).toHaveBeenCalledWith('node');
        expect(res.json).toHaveBeenCalledWith(posts);
    });

    it('rejects searches without a term', async () => {
        const res = mockResponse();

        await postController.search({ query: {} }, res);

        expect(postRepository.searchPosts).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'O termo de busca é obrigatório.' });
    });

    it('returns a post by id', async () => {
        const post = { id: 1, title: 'Title', content: 'Content', author: 'Author' };
        postRepository.findById.mockResolvedValue(post);
        const res = mockResponse();

        await postController.getById({ params: { id: '1' } }, res);

        expect(postRepository.findById).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(post);
    });

    it('returns 404 when a post is not found by id', async () => {
        postRepository.findById.mockResolvedValue(null);
        const res = mockResponse();

        await postController.getById({ params: { id: '999' } }, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Post não encontrado.' });
    });

    it('updates a post when required fields are present', async () => {
        const body = { title: 'Updated', content: 'Text', author: 'Teacher' };
        const updatedPost = { id: 1, ...body };
        postRepository.update.mockResolvedValue(updatedPost);
        const res = mockResponse();

        await postController.update({ params: { id: '1' }, body }, res);

        expect(postRepository.update).toHaveBeenCalledWith('1', body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedPost);
    });

    it('rejects updates without required fields', async () => {
        const res = mockResponse();

        await postController.update({ params: { id: '1' }, body: { title: 'Updated' } }, res);

        expect(postRepository.update).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Campos obrigatórios ausentes: title, content e author.',
        });
    });

    it('deletes a post', async () => {
        postRepository.delete.mockResolvedValue(true);
        const res = mockResponse();

        await postController.delete({ params: { id: '1' } }, res);

        expect(postRepository.delete).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Post deletado com sucesso.' });
    });
});

const request = require('supertest')

const app = require('../../src/app')
const truncate = require('../utils/truncate')

const { User } = require('../../src/app/models')
const factory = require('../factories')

describe('Database', () => {
    beforeEach(async () => {
        await truncate()
    })
    it('should be create new user with success', async () => {
        const user = await User.create({
            name: 'Diego',
            email: 'diego@rocketseat.com.br',
            password_hash: '334542423'
        })

        // console.log(user)
        expect(user.email).toBe('diego@rocketseat.com.br')
    })
})

describe('Authentication', () => {
    beforeEach(async () => {
        await truncate()
    })

    it('should receive JWT token when authenticated with valid credential', async () => {
        const user = await factory.create('User', {
            password: '123456'
        })

        // console.log(user)

        const response = await request(app)
            .post('/sessions')
            .send({
                email: user.email,
                password: '123456'
            })

        expect(response.status).toBe(200)
    })

    it('should not authenticate with invalid credentials', async () => {
        const user = await factory.create('User', {
            password: '123123'
        })

        const response = await request(app)
            .post('/sessions')
            .send({
                email: user.email,
                password: '123456'
            })

        expect(response.status).toBe(401)
    })

    it('should return jwt token when authenticated', async () => {
        const user = await factory.create('User', {
            password: '123123'
        })

        const response = await request(app)
            .post('/sessions')
            .send({
                email: user.email,
                password: '123123'
            })

        expect(response.body).toHaveProperty('token')
    })

    it('should be able to access private routes when authenticate', async () => {
        const user = await factory.create('User', {
            password: '123123'
        })

        const response = await request(app)
            .get('/dashboard')
            .set('Authorization', `Bearer ${user.generateToken()}`)
        
        expect(response.status).toBe(200)
    })

    it('should not be able to access private routes without jwt token', async () => {
        const response = await request(app).get('/dashboard')

        expect(response.status).toBe(401)
    })

    it('should not be able to access private routes with invalid jwt token', async () => {
        const response = await request(app)
            .get('/dashboard')
            .set('Authorization', 'Bearer 123456')
        
        expect(response.status).toBe(401)
    })
})

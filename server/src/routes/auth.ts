import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function authRoutes(fastify: FastifyInstance) {
    // Retorna os Dados do Usuario
    fastify.get('/me', {
        onRequest: [authenticate]
    }, async req => {
        return { user: req.user }
    })

    // Enviar e Receber Token
    fastify.post('/users', async req => {
        // Validar os dados pra ser tratado antes de enviar pro DB (utilizando o zod)
        const createUserBody = z.object({
            access_token: z.string()
        })

        const { access_token } = createUserBody.parse(req.body)

        // Enviar o Token pra API do google 
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })

        // Info q o Google retornará
        const userData = await userResponse.json()
        // Validar os dados retornados
        const userInfoSchema = z.object({
            id: z.string(),
            email: z.string().email(),
            name: z.string(),
            picture: z.string().url()
        })
        const userInfo = userInfoSchema.parse(userData)

        // Verificar se o usuario ja fez login na app vendo se possui o googleId
        let user = await prisma.user.findUnique({
            where: {
                googleId: userInfo.id
            }
        })

        // Cadastrar o usuario no DB caso ñ possua googleId
        if(!user) {
            user = await prisma.user.create({
                data: {
                    googleId: userInfo.id,
                    name: userInfo.name,
                    email: userInfo.email,
                    avataUrl: userInfo.picture
                }
            })
        }

        // Gerar Token
        const token = fastify.jwt.sign({
            name: user.name,
            avataUrl: user.avataUrl
        }, {
            sub: user.id, // Qm gerou o Token
            expiresIn: '7 days' // Qndo o Token expirar, o usuario é deslogado !
            // Refresh Token -> pra ser um Token sem expirar
        })

        return { token }
    })
}
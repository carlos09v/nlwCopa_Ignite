import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function guessRoutes(fastify: FastifyInstance) {
    // Count Guess
    fastify.get('/guesses/count', async () => {
        // Contagem de Palpites
        const count = await prisma.guess.count()
        
        return { count }
    })

    // Create Guess
    fastify.post('/pools/:poolId/games/:gameId/guesses', {
        onRequest: [authenticate]
    }, async (req, res) => {
        // Validar os dados pra ser tratado antes de enviar pro DB (utilizando o zod)
        const createGuessParams = z.object({
            poolId: z.string(),
            gameId: z.string()
        })

        const createGuessBody = z.object({
            firstTeamPoints: z.number(),
            secondTeamPoint: z.number()
        })

        const { poolId, gameId } = createGuessParams.parse(req.params)
        const { firstTeamPoints, secondTeamPoint } = createGuessBody.parse(req.body)

        // ---- Validações
        const participant = await prisma.participant.findUnique({
            where: {
                userId_poolId: {
                    poolId,
                    userId: req.user.sub
                }
            }
        })

        if(!participant) {
            return res.status(400).send({
                message: "You're not allowed to create a guess inside this pool."
            })
        }

        // Procurar se ja existe Game igual
        const guess = await prisma.guess.findUnique({
            where: {
                participantId_gameId: {
                    participantId: participant.id,
                    gameId
                }
            }
        })
        if (guess) {
            return res.status(400).send({
                message: "You already sent a guess to this game on this pool."
            })
        }

        // Procurar o Game
        const game = await prisma.game.findUnique({
            where: {
                id: gameId
            }
        })
        if (!game) {
            return res.status(400).send({
                message: "Game not found !"
            })
        }

        // Se a data do game for antes da data de hj (atual)
        if(game.date < new Date()) {
            return res.status(400).send({
                message: "You cannot send guesses after the game date."
            })
        }

        // Caso passe pelas validações, cria o palpite
        await prisma.guess.create({
            data: {
                gameId,
                participantId: participant.id,
                firstTeamPoints,
                secondTeamPoint
            }
        })

        return res.status(201).send()
    })
}
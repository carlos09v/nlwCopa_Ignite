import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function gameRoutes(fastify: FastifyInstance) {
    // List Games
    fastify.get('/pools/:id/games', {
        onRequest: [authenticate]
    }, async req => {
        const getPoolParams = z.object({
            id: z.string()
        })
        const { id } = getPoolParams.parse(req.params) // Parametros (e ñ no body)

        const games = await prisma.game.findMany({
            orderBy: {
                date: 'desc'
            },
            include: {
                guesses: {
                    where: {
                        participant: {
                            userId: req.user.sub,
                            poolId: id
                        }
                    }
                }
            }
        })

        return { 
            games: games.map(game => {
                return {
                    ...game,
                    guess: game.guesses.length > 0 ? game.guesses[0] : null,
                    guesses: undefined
                }
            })
        }
    })
}
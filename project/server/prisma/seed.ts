import { PrismaClient } from '@prisma/client'

import { gamesScheudle } from '../src/api/data'
// Seed - Dados Iniciais

// Conectar com o DB
const prisma = new PrismaClient({})

async function main() {
    // Data API - 08/11/2022

    gamesScheudle.forEach(async data => {
        await prisma.game.create({
            data
        })
    })
}

main()

/* 
const user = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            avataUrl: 'https://github.com/diego3g.png'
        }
    })

    const pool = await prisma.pool.create({
        data: {
            title: 'Example Pool',
            code: 'BOL123',
            ownerId: user.id,

            participants: {
                create: {
                    userId: user.id
                }
            }
        }
    })

    await prisma.game.create({
        data: {
            date: '2022-11-02T12:43:26.722Z',
            firstTeamCountryCode: 'DE',
            secondTeamCountryCode: 'BR'
        }
    })

    await prisma.game.create({
        data: {
            date: '2022-11-03T00:00:26.722Z',
            firstTeamCountryCode: 'BR',
            secondTeamCountryCode: 'AR',

            guesses: {
                create: {
                    firstTeamPoints: 2,
                    secondTeamPoint: 1,

                    participant: {
                        connect: {
                            userId_poolId: {
                                userId: user.id,
                                poolId: pool.id
                            }
                        }
                    }
                }
            }
        }
    })
*/
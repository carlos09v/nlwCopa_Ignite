import { FastifyInstance } from 'fastify'
import ShortUniqueId from 'short-unique-id'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function poolRoutes(fastify: FastifyInstance) {
    // Count Pools
    fastify.get('/pools/count', async () => {
        // Contagem de Bolão
        const count = await prisma.pool.count() // Quntos bolões tem
        
        return { count }
    })

    // Create Pool
    fastify.post('/pools', async (req, res) => {
        // Criação de novo Bolão
        // Validar os dados pra ser tratado antes de enviar pro DB (utilizando o zod)
        const createPoolBody = z.object({
            title: z.string()
        })
        const { title } = createPoolBody.parse(req.body)

        // Criar codigo de 6 digitos
        const generate = new ShortUniqueId({ length: 6 })
        const code = String(generate()).toUpperCase()

        try {
            // Se o usuario tiver autenticado
            await req.jwtVerify()

            // Enviar pro DB
            await prisma.pool.create({
                data: {
                    title,
                    code,
                    ownerId: req.user.sub,

                    participants: {
                        create: {
                            userId: req.user.sub
                        }
                    }
                }
            })
        }catch {
            // Se o ñ usuario tiver autenticado
            // Enviar pro DB
            await prisma.pool.create({
                data: {
                    title,
                    code
                }
            })
        }
        
        
        // Retorna o Code
        return res.status(201).send({ code })
        
        // return { title }
    })

    // Join Pool
    fastify.post('/pools/join', {
        onRequest: [authenticate]
    }, async (req, res) => {
        // Validar os dados pra ser tratado antes de enviar pro DB (utilizando o zod)
        const joinPoolBody = z.object({
            code: z.string()
        })
        const { code } = joinPoolBody.parse(req.body)

        // Procurar Bolão
        // Select
        const pool = await prisma.pool.findUnique({
            where: {
                code
            },
            include: {
                participants: {
                    where: {
                        userId: req.user.sub
                    }
                }
            }
        })

        // Se ñ existir bolão
        if(!pool) {
            return res.status(400).send({
                message: 'Pool not Found.'
            })
        }

        // Se o usuario ja participa do bolão
        if(pool.participants.length > 0) {
            return res.status(400).send({
                message: 'You already joined this pool.'
            })
        }

        // Se o usuario tentar participar de um bolão e ñ tiver um dono (ownerId)
        if(!pool.ownerId) {
            await prisma.pool.update({
                where: {
                    id: pool.id
                },
                data: {
                    ownerId: req.user.sub
                }
            })
        }

        await prisma.participant.create({
            data: {
                poolId: pool.id,
                userId: req.user.sub
            }
        })

        return res.status(201).send()
    })

    // List Pools
    fastify.get('/pools', {
        onRequest: [authenticate]
    }, async req => {
        // Select DB
        const pools = await prisma.pool.findMany({
            where: {
                participants: {
                    // Pelo menos 1
                    some: {
                        userId: req.user.sub
                    }
                }
            },
            include: {
                // Count dos Participantes do Bolão
                _count: {
                    select: {
                        participants: true
                    }
                },
                // id + avatarUrl dos 4 primeiros Participantes
                participants: {
                    select: {
                        id: true,

                        // Tabela Relacionada: user
                        user: {
                            select: {
                                avataUrl: true
                            }
                        }
                    },
                    take: 4
                },
                // O id e o nome do dono (owner)
                owner: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return { pools }
    })

    // get Pool
    fastify.get('/pools/:id', {
        onRequest: [authenticate]
    }, async req => {
        const getPoolParams = z.object({
            id: z.string()
        })
        const { id } = getPoolParams.parse(req.params) // Parametros (e ñ no body)

        // Select DB
        const pool = await prisma.pool.findUnique({
            where: {
                id
            },
            include: {
                // Count dos Participantes do Bolão
                _count: {
                    select: {
                        participants: true
                    }
                },
                // id + avatarUrl dos 4 primeiros Participantes
                participants: {
                    select: {
                        id: true,

                        // Tabela Relacionada: user
                        user: {
                            select: {
                                avataUrl: true
                            }
                        }
                    },
                    take: 4
                },
                // O id e o nome do dono (owner)
                owner: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return { pool }
    })
}
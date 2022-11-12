import Fastify from "fastify";
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { poolRoutes } from "./routes/pool";
import { userRoutes } from "./routes/user";
import { guessRoutes } from "./routes/guess";
import { gameRoutes } from "./routes/game";
import { authRoutes } from "./routes/auth";

// singleton ->

async function bootstrap() {
    // Criar o server
    const fastify = Fastify({
        logger: true // Log dos erros, alertas
    })

    await fastify.register(cors, {
        origin: true // Qlquer aplicação pode acessar o back-end
        // em ambiente dev = true. Em prod é so adicionar os domínios Ex: google.com
    })

    
    // Em produção isso precisa ser uma variável ambiente
    await fastify.register(jwt, {
        secret: 'nlwcopa'
    })

    // http://localhost:3333

    // Utilizar Interfaces de API pra testar. (Ex: Postman, insomnia, hoppscotch)
    // Importar Rotas
    await fastify.register(poolRoutes)
    await fastify.register(authRoutes)
    await fastify.register(gameRoutes)
    await fastify.register(userRoutes)
    await fastify.register(guessRoutes)

    
    await fastify.listen({ port: 3333, host: '0.0.0.0' })
}

bootstrap()
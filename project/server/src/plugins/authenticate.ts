import { FastifyRequest } from "fastify";

export async function authenticate(req: FastifyRequest) {
    // Validar Token
    await req.jwtVerify()
}
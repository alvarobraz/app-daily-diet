import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

// Defina uma interface para o tipo de usuário esperado
interface UserPayload {
  id: string;
  name: string;
  email: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  created_at: string;
  session_id?: string; // session_id é opcional no payload para o request.user
}

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized. Session ID missing.',
    })
  }

  // Busca o usuário no banco de dados e assevera o tipo para UserPayload
  const user = await knex('users')
    .where('session_id', sessionId)
    .first<UserPayload>() // <--- Adicione a asserção de tipo aqui

  if (!user) {
    return reply.status(401).send({
      error: 'Unauthorized. Invalid session ID.',
    })
  }

  // Se o usuário for encontrado, anexa-o ao objeto request
  request.user = user
}
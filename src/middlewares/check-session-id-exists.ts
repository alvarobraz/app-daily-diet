import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

interface UserPayload {
  id: string;
  name: string;
  email: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  created_at: string;
  session_id?: string;
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

  const user = await knex('users')
    .where('session_id', sessionId)
    .first<UserPayload>()

  if (!user) {
    return reply.status(401).send({
      error: 'Unauthorized. Invalid session ID.',
    })
  }

  request.user = user
}
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      age: z.number(),
      weight_kg: z.number(),
      height_cm: z.number(),
    })

    const { name, email, age, weight_kg, height_cm } =
      createUserBodySchema.parse(request.body)

  
    const existingUser = await knex('users').where({ email }).first()
    if (existingUser) {
      return reply.status(409).send({ message: 'User with this email already exists.' })
    }

    const userId = randomUUID()
    const sessionId = randomUUID() 

    await knex('users').insert({
      id: userId,
      name,
      email,
      age,
      weight_kg,
      height_cm,
      session_id: sessionId 
    })

    
    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
    })

    return reply.status(201).send({ userId })
  })


  app.post('/auth', async (request, reply) => {
    const authenticateUserBodySchema = z.object({
      email: z.string().email(),
    })

    const { email } = authenticateUserBodySchema.parse(request.body)

    const user = await knex('users').where({ email }).first()

    if (!user) {
      return reply.status(401).send({ message: 'Invalid credentials.' })
    }

    const newSessionId = randomUUID()

    await knex('users')
      .where({ id: user.id })
      .update({ session_id: newSessionId })

    reply.setCookie('sessionId', newSessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return reply.status(200).send({ message: 'Authentication successful!', userId: user.id })
  })

  app.get(
    '/me',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      
      return { user: request.user }
    },
  )
}

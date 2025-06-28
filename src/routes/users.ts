import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(), // Adicionado validação de e-mail
      age: z.number(),
      weight_kg: z.number(),
      height_cm: z.number(),
    })

    const { name, email, age, weight_kg, height_cm } =
      createUserBodySchema.parse(request.body)

    // Verifica se já existe um usuário com o mesmo e-mail
    const existingUser = await knex('users').where({ email }).first()
    if (existingUser) {
      return reply.status(409).send({ message: 'User with this email already exists.' })
    }

    const userId = randomUUID()
    const sessionId = randomUUID() // Gerar sessionId para o novo usuário

    await knex('users').insert({
      id: userId,
      name,
      email,
      age,
      weight_kg,
      height_cm,
      session_id: sessionId // Salva o session_id no banco de dados
    })

    // Define o cookie de sessão para o novo usuário
    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true, // Para segurança, o cookie não pode ser acessado via JavaScript do lado do cliente
      secure: process.env.NODE_ENV === 'production', // Apenas em HTTPS para produção
      sameSite: 'lax', // Proteção contra CSRF
    })

    return reply.status(201).send({ userId })
  })

  // Rota de autenticação (login)
  app.post('/auth', async (request, reply) => {
    const authenticateUserBodySchema = z.object({
      email: z.string().email(),
    })

    const { email } = authenticateUserBodySchema.parse(request.body)

    const user = await knex('users').where({ email }).first()

    if (!user) {
      return reply.status(401).send({ message: 'Invalid credentials.' })
    }

    // Se o usuário existir, gera um novo sessionId ou usa o existente (se preferir manter o mesmo)
    // Para simplificar e garantir que um novo sessionId seja sempre gerado no login:
    const newSessionId = randomUUID()

    await knex('users')
      .where({ id: user.id })
      .update({ session_id: newSessionId }) // Atualiza o session_id no banco de dados

    reply.setCookie('sessionId', newSessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return reply.status(200).send({ message: 'Authentication successful!', userId: user.id })
  })

  app.get(
    '/',
    async () => {
      const users = await knex('users')
      .select('id', 'name', 'email', 'age', 'weight_kg', 'height_cm', 'created_at') // Evita expor session_id

      return { users }
    },
  )

  app.get(
    '/me',
    {
      preHandler: [checkSessionIdExists], // Aplica o middleware aqui
    },
    async (request) => {
      
      return { user: request.user }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getTransactionsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionsParamsSchema.parse(request.params)

      // const { sessionId } = request.cookies

      const user = await knex('users')
        .where({
          id
        })
        .select('id', 'name', 'email', 'age', 'weight_kg', 'height_cm', 'created_at') // Evita expor session_id
        .first()

        if (!user) {
          return reply.status(404).send({ message: 'User not found.' })
        }

      return {
        user,
      }
    },
  )
}
